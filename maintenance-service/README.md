# equipmap maintenance-service

Spring Boot service responsible for maintenance CRUD, completion, optimistic locking and reliable event publication through a transactional outbox.

## Run locally

```powershell
cd C:\Fontes\fe-equipmap\maintenance-service
.\gradlew.bat bootRun
```

The API starts at `http://localhost:8084`.

Useful URLs:

- `GET http://localhost:8084/actuator/health`
- `http://localhost:8084/swagger-ui.html`

## Run with PostgreSQL and RabbitMQ

```powershell
cd C:\Fontes\fe-equipmap\maintenance-service
docker compose up --build
```

The compose file exposes:

- Maintenance API: `8084`
- PostgreSQL: `5436`
- RabbitMQ AMQP: `5674`
- RabbitMQ Management UI: `15674`

## Required request headers

- `X-User-Id`: authenticated user UUID
- `X-User-Role`: `ADMIN`, `MANAGER`, or `VIEWER`
- `X-Condominium-Id`: active condominium UUID
