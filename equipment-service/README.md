# equipmap equipment-service

Spring Boot service responsible for equipment CRUD, soft delete, automatic patrimony codes and reliable event publication through a transactional outbox.

## Run locally

```powershell
cd C:\Fontes\fe-equipmap\equipment-service
.\gradlew.bat bootRun
```

The API starts at `http://localhost:8083`.

Useful URLs:

- `GET http://localhost:8083/actuator/health`
- `http://localhost:8083/swagger-ui.html`

## Run with PostgreSQL and RabbitMQ

```powershell
cd C:\Fontes\fe-equipmap\equipment-service
docker compose up --build
```

The compose file exposes:

- Equipment API: `8083`
- PostgreSQL: `5435`
- RabbitMQ AMQP: `5673`
- RabbitMQ Management UI: `15673`

## Required request headers

The service trusts identity propagated by the BFF/Auth gateway:

- `X-User-Id`: authenticated user UUID
- `X-User-Role`: `ADMIN`, `MANAGER`, or `VIEWER`
- `X-Condominium-Id`: active condominium UUID

Seed condominium commonly used in local development:

- `11111111-1111-1111-1111-111111111111`
