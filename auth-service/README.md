# auth-service

Spring Boot service responsible for EquipMap authentication, refresh token rotation, RBAC and active condominium switching.

## Requirements

- Java 21
- Docker Desktop, for PostgreSQL/local service orchestration

## Local Build

```powershell
cd C:\Fontes\fe-equipmap\auth-service
.\gradlew.bat build
```

## Run With Docker Compose

```powershell
cd C:\Fontes\fe-equipmap\auth-service
docker compose up --build
```

Service URLs:

- API: `http://localhost:8081`
- Health: `http://localhost:8081/actuator/health`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

Seed credentials:

```text
admin@equipmap.local
admin123
```

Override seed values with environment variables:

```powershell
$env:AUTH_SEED_ADMIN_EMAIL="admin@equipmap.local"
$env:AUTH_SEED_ADMIN_PASSWORD="admin123"
```

## Login Example

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8081/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@equipmap.local","password":"admin123"}' `
  -SessionVariable authSession
```

The refresh token is returned as an httpOnly cookie. Use the same session for refresh:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8081/auth/refresh -WebSession $authSession
```
