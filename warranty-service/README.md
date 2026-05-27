# warranty-service

Spring Boot service for equipment warranties, document upload references and warranty alert events.

## Run locally

```powershell
docker compose up --build
```

Service: `http://localhost:8085`

Swagger UI: `http://localhost:8085/swagger-ui.html`

RabbitMQ Management: `http://localhost:15675`

MinIO Console: `http://localhost:9001`

## Local build

```powershell
..\.tools\gradle-8.13\bin\gradle.bat --no-daemon build
```

The service uses `equipmap-core` through Gradle composite build (`includeBuild("../equipmap-core")`).
