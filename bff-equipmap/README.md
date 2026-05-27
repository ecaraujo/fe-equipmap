# bff-equipmap

GraphQL BFF for EquipMap. Runtime execution always routes GraphQL operations to the real EquipMap microservices.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test:e2e
npm run test:contract
```

The GraphQL endpoint defaults to `http://localhost:4000/graphql`.

## Required Service Configuration

Set each service URL before starting the BFF:

```bash
AUTH_SERVICE_URL=http://localhost:8081
CONDOMINIUM_SERVICE_URL=http://localhost:8082
EQUIPMENT_SERVICE_URL=http://localhost:8083
MAINTENANCE_SERVICE_URL=http://localhost:8084
WARRANTY_SERVICE_URL=http://localhost:8085
PARKING_SERVICE_URL=http://localhost:8086
BRIGADIER_SERVICE_URL=http://localhost:8087
NOTIFICATION_SERVICE_URL=http://localhost:8088
JWT_SECRET=dev-only-change-me-dev-only-change-me-dev-only-change-me
JWT_ISSUER=equipmap-auth-service
```

The BFF fails during startup when a required service URL is missing. It propagates `x-user-id`, `x-user-role`, `x-condominium-id`, `x-trace-id`, cookies and bearer token to downstream services.

## Local Login

With the integrated Docker stack running, use the seeded admin credentials:

```graphql
mutation {
  login(input: { email: "admin@equipmap.local", password: "admin123" }) {
    token
    user { id name role condominiumId }
  }
}
```

Use the returned token as `Authorization: Bearer <token>` for protected operations.
