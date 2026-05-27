# equipmap-infra

Infra local completa do EquipMap MVP.

## Pre-requisitos

- Docker Desktop com Compose v2
- JDK 21 e Gradle wrapper/Gradle local para gerar os JARs dos serviços Java
- Node.js para o BFF/frontend e scripts de smoke

## Preparar artefatos

Os Dockerfiles dos serviços Java copiam `build/libs/*service-*.jar`, então gere os jars antes de subir a stack:

```powershell
cd ..\auth-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\condominium-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\equipment-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\maintenance-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\warranty-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\parking-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\brigadier-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\notification-service; ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
cd ..\bff-equipmap; npm run build
cd ..\equipmap-infra
```

## Subir tudo

```powershell
copy .env.example .env
docker compose --env-file .env up --build
```

Endpoints:

- Frontend: `http://localhost:5173`
- BFF GraphQL: `http://localhost:4000/graphql`
- RabbitMQ Management: `http://localhost:15672`
- MinIO Console: `http://localhost:9001`
- Serviços: `http://localhost:8081` a `http://localhost:8088`

Credenciais de bootstrap:

- Email: `admin@equipmap.local`
- Senha: `admin123`

## Validar

Em outro terminal:

```powershell
node scripts/check-health.mjs
node scripts/verify-runtime-mocks.mjs
node scripts/e2e-smoke.mjs
```

A verificação de runtime mocks falha se encontrar flags ou providers genéricos de mock em código/configuração de runtime. O smoke cobre login, listagem de condomínios, CRUD inicial de equipamento, manutenção, garantia, sorteio de vaga, brigadista e consulta de notificações.

## Homologação Completa (MVP)

Para rodar toda a suíte de homologação (tasks 12.14, 13.4–13.11):

```powershell
node scripts/run-homologation.mjs
```

Ou individualmente:

| Script | Task | O que valida |
|--------|------|-------------|
| `verify-runtime-mocks.mjs` | 4.3 | Garante ausência de `useMock`, `MOCK_MODE` e `Mock*Provider` em runtime |
| `e2e-smoke.mjs` | 12.14, 13.4, 13.5 | Fluxo E2E completo (login → CRUD → sorteio → notificações) |
| `validate-brigadier-bulk.mjs` | 13.6 | Envio em massa para brigadistas + exclusão de inativos |
| `validate-rbac.mjs` | 13.7 | RBAC (viewer=403 em write, admin=full, manager=parcial) |
| `validate-multi-tenant.mjs` | 13.8 | Isolamento de dados entre condomínios |
| `validate-jobs-idempotency.mjs` | 13.9 | Jobs diários não duplicam notificações |
| `validate-rabbitmq-resilience.mjs` | 13.10 | Outbox + DLQ sobrevivem a queda do broker |
| `validate-latency.mjs` | 13.11 | p95 ≤ 500ms em queries de listagem |

Para pular o teste destrutivo (para/reinicia RabbitMQ):

```powershell
node scripts/run-homologation.mjs --skip-destructive
```

## Notas de homologação

- O BFF não possui modo mock de runtime; ele aponta para os serviços reais dentro da rede Docker e falha se uma URL obrigatória não estiver configurada.
- O frontend sempre usa `VITE_API_BASE_URL=http://localhost:4000/graphql` na stack integrada.
- O envio externo de brigadistas usa `SandboxMessagingProvider` apenas quando `EQUIPMAP_MESSAGING_PROVIDER=sandbox` estiver explícito no ambiente local/MVP.
- RabbitMQ, PostgreSQL e MinIO são compartilhados na stack completa.
- Cada serviço continua podendo ser executado isoladamente pelo seu próprio `docker-compose.yml`.
