# equipmap condominium-service

Spring Boot service responsible for condominium CRUD and user associations.

## Run locally

```powershell
cd C:\Fontes\fe-equipmap\condominium-service
.\gradlew.bat bootRun
```

The API starts at `http://localhost:8082`.

Useful URLs:

- `GET http://localhost:8082/actuator/health`
- `http://localhost:8082/swagger-ui.html`

## Run with PostgreSQL

```powershell
cd C:\Fontes\fe-equipmap\condominium-service
docker compose up --build
```

The compose file exposes PostgreSQL on host port `5434` and the service on `8082`.

## Required request headers

The service trusts identity propagated by the BFF/Auth gateway:

- `X-User-Id`: authenticated user UUID
- `X-User-Role`: `ADMIN`, `MANAGER`, or `VIEWER`
- `X-Condominium-Id`: active condominium UUID

Seed condominium:

- id: `11111111-1111-1111-1111-111111111111`
- cnpj: `12345678000199`
