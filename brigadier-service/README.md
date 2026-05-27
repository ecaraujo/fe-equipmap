# brigadier-service

Spring Boot service for brigadier registration, certification monitoring and asynchronous notifications.

Local/MVP notification delivery uses `SandboxMessagingProvider`, enabled only when
`EQUIPMAP_MESSAGING_PROVIDER=sandbox` or `equipmap.messaging.provider=sandbox` is set.
Without a configured provider the service fails startup with an explicit messaging
configuration error.

Mockito doubles in the test suite are unit-test fixtures only; they are not runtime
messaging fallbacks.

## Run locally

```powershell
docker compose up --build
```

Service: `http://localhost:8087`

Swagger UI: `http://localhost:8087/swagger-ui.html`

RabbitMQ Management: `http://localhost:15676`

## Local build

```powershell
..\.tools\gradle-8.13\bin\gradle.bat --no-daemon build
```
