import type { Request } from "express";
import { v4 as uuid } from "uuid";
import { getBearerToken, type AuthClaims, verifyAccessToken } from "./auth.js";
import { createDataSources, type BffDataSources } from "./data-sources.js";
import { SimpleDataLoader } from "./loaders.js";

export interface GraphQLContext {
  auth: AuthClaims | null;
  traceId: string;
  cookie?: string;
  operationName?: string;
  dataSources?: BffDataSources;
  loaders?: {
    equipmentById: SimpleDataLoader<string, unknown>;
    condominiumById: SimpleDataLoader<string, unknown>;
  };
}

const PUBLIC_OPERATIONS = new Set(["login", "socialLogin", "refresh", "IntrospectionQuery"]);

export function createContext(req: Request): GraphQLContext {
  const traceId = String(req.headers["x-trace-id"] ?? uuid());
  const operationName = typeof req.body?.operationName === "string" ? req.body.operationName : undefined;
  const token = getBearerToken(req.headers.authorization);
  const cookie = req.headers.cookie;

  if (!token || isPublicOperation(operationName)) {
    const ctx: GraphQLContext = { auth: null, traceId, cookie, operationName };
    ctx.dataSources = createDataSources(ctx);
    ctx.loaders = createLoaders(ctx.dataSources);
    return ctx;
  }

  const ctx: GraphQLContext = {
    auth: verifyAccessToken(token),
    traceId,
    cookie,
    operationName,
  };
  ctx.dataSources = createDataSources(ctx);
  ctx.loaders = createLoaders(ctx.dataSources);
  return ctx;
}

export function isPublicOperation(operationName?: string): boolean {
  return Boolean(operationName && PUBLIC_OPERATIONS.has(operationName));
}

function createLoaders(dataSources: BffDataSources): GraphQLContext["loaders"] {
  return {
    equipmentById: new SimpleDataLoader((ids) =>
      Promise.all(ids.map((id) => dataSources.equipment.get(`/equipment/${id}`, dataSources.requestOptions()))),
    ),
    condominiumById: new SimpleDataLoader((ids) =>
      Promise.all(ids.map((id) => dataSources.condominium.get(`/condominiums/${id}`, dataSources.requestOptions()))),
    ),
  };
}
