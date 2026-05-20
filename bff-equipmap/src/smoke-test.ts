import { ApolloServer } from "@apollo/server";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

const login = await server.executeOperation({
  query: `#graphql
    mutation login($input: LoginInput!) {
      login(input: $input) {
        token
        user {
          id
          name
          role
          condominiumId
        }
      }
    }
  `,
  variables: {
    input: {
      email: "admin@equipmap.local",
      password: "admin123",
    },
  },
});

if (login.body.kind !== "single" || login.body.singleResult.errors?.length) {
  throw new Error(`Login smoke test failed: ${JSON.stringify(login.body)}`);
}

const token = (login.body.singleResult.data?.login as { token: string }).token;
const equipments = await server.executeOperation(
  {
    query: `#graphql
      query equipments($pagination: PaginationInput) {
        equipments(pagination: $pagination) {
          pageInfo {
            total
            page
            pageSize
            totalPages
          }
          data {
            id
            name
            type
            typeLabel
            status
            statusLabel
          }
        }
      }
    `,
    variables: {
      pagination: { page: 1, pageSize: 2 },
    },
  },
  {
    contextValue: {
      auth: {
        userId: "user-001",
        role: "ADMIN",
        condominiumId: "cond-001",
      },
      traceId: "smoke-test",
    },
  },
);

if (equipments.body.kind !== "single" || equipments.body.singleResult.errors?.length) {
  throw new Error(`Equipment smoke test failed: ${JSON.stringify(equipments.body)}`);
}

if (!token) {
  throw new Error("Smoke test did not receive an access token");
}

await server.stop();
console.log("BFF mock smoke test passed.");
