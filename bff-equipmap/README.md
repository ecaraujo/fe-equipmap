# bff-equipmap

GraphQL BFF for EquipMap. Fase A runs in mock mode with Apollo Server, deterministic seed data and the same response shape expected from the real services.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test:e2e
```

The GraphQL endpoint defaults to `http://localhost:4000/graphql`.

## Mock Login

Use:

```graphql
mutation {
  login(input: { email: "admin@equipmap.local", password: "admin123" }) {
    token
    user { id name role condominiumId }
  }
}
```

Use the returned token as `Authorization: Bearer <token>` for protected operations.
