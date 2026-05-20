import http from "node:http";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express4";
import { v4 as uuid } from "uuid";
import { config } from "./config.js";
import { createContext } from "./context.js";
import { rateLimitMiddleware } from "./rate-limit.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

const app = express();
const httpServer = http.createServer(app);

app.disable("x-powered-by");
app.use((req, res, next) => {
  const traceId = String(req.headers["x-trace-id"] ?? uuid());
  req.headers["x-trace-id"] = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "bff-equipmap",
    mockMode: config.mockMode,
    timestamp: new Date().toISOString(),
  });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
  formatError(formattedError) {
    const extensions = formattedError.extensions ?? {};
    const statusCode = Number(extensions.statusCode ?? 500);

    return {
      message: formattedError.message,
      extensions: {
        code: extensions.code ?? "INTERNAL_SERVER_ERROR",
        statusCode,
        details: extensions.details ?? [],
        timestamp: extensions.timestamp ?? new Date().toISOString(),
        traceId: extensions.traceId,
      },
    };
  },
});

await server.start();

app.use(
  config.graphqlPath,
  cors<cors.CorsRequest>({
    origin(origin, callback) {
      if (!origin || origin === config.frontendOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
  express.json({ limit: "1mb" }),
  rateLimitMiddleware,
  expressMiddleware(server, {
    context: async ({ req }) => createContext(req),
  }),
);

await new Promise<void>((resolve) => {
  httpServer.listen({ port: config.port }, resolve);
});

console.log(`bff-equipmap ready at http://localhost:${config.port}${config.graphqlPath}`);
