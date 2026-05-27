# parking-service

Spring Boot service for parking apartments, parking spots and auditable lottery execution.

## Run locally

```powershell
docker compose up --build
```

Service: `http://localhost:8086`

Swagger UI: `http://localhost:8086/swagger-ui.html`

## Local build

```powershell
..\.tools\gradle-8.13\bin\gradle.bat --no-daemon build
```

The service uses `equipmap-core` through Gradle composite build (`includeBuild("../equipmap-core")`).
