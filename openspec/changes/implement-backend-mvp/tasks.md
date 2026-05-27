## 1. Fase A — BFF Mockado (Schema + Resolvers Mock)

- [x] 1.1 Criar repositório `bff-equipmap` com Node.js + TypeScript + Apollo Server
- [x] 1.2 Configurar projeto: package.json, tsconfig, eslint, prettier, Docker Compose (self-contained)
- [x] 1.3 Definir schema GraphQL completo: types, enums (limpos, sem acentos), inputs, queries, mutations
- [x] 1.4 Implementar resolvers mock para auth (login, logout, refresh, me, switchCondominium)
- [x] 1.5 Implementar resolvers mock para condominium (condominiums, condominium, createCondominium, etc.)
- [x] 1.6 Implementar resolvers mock para equipment (equipments, equipment, createEquipment, etc.)
- [x] 1.7 Implementar resolvers mock para maintenance (maintenances, maintenance, createMaintenance, completeMaintenance, etc.)
- [x] 1.8 Implementar resolvers mock para warranty (warranties, warranty, createWarranty, warrantyUploadUrl, etc.)
- [x] 1.9 Implementar resolvers mock para parking (parkingApartments, parkingSpots, parkingResults, executeLottery, etc.)
- [x] 1.10 Implementar resolvers mock para brigadier (brigadiers, brigadier, createBrigadier, notifyBrigadiers, etc.)
- [x] 1.11 Implementar resolvers mock para notification (notifications, markNotificationRead, markAllNotificationsRead, deleteNotification)
- [x] 1.12 Implementar middleware de JWT validation (verificar assinatura, claims userId/role/condominiumId)
- [x] 1.13 Implementar rate limiting por IP/usuário
- [x] 1.14 Implementar CORS restrito ao domínio do frontend
- [x] 1.15 Implementar formato de erro padronizado com extensions (code, statusCode, details, timestamp, traceId)
- [x] 1.16 Implementar suporte a paginação (page, pageSize) nos resolvers de listagem
- [x] 1.17 Implementar mapeamento de enums limpos no schema (CLIMATIZATION, TRANSPORT, etc.)
- [x] 1.18 Criar seed de dados mock realistas (faker/factory) para todas as entidades
- [x] 1.19 Testar BFF mockado end-to-end com GraphQL Playground/Sandbox
- [x] 1.20 Exportar schema.graphql para consumo do frontend (graphql-codegen)

## 2. Fase B — Frontend Migrado para Apollo Client + Codegen

- [x] 2.1 Instalar Apollo Client, @apollo/client, graphql no fe-equipmap
- [x] 2.2 Instalar e configurar @graphql-codegen/cli com plugins (typescript, typescript-operations, typescript-react-apollo)
- [x] 2.3 Configurar codegen.yml apontando para schema.graphql do BFF
- [x] 2.4 Gerar types e hooks iniciais via codegen
- [x] 2.5 Criar ApolloProvider com auth link (JWT no header Authorization) e error link
- [x] 2.6 Implementar token refresh automático via Apollo Link (intercepta 401, tenta refresh, retry)
- [x] 2.7 Migrar AuthContext para usar mutations GraphQL (login, logout, refresh, switchCondominium, me)
- [x] 2.8 Implementar tela de seleção de condomínio (pós-login, multi-tenancy)
- [x] 2.9 Migrar hook useEquipment → hooks gerados pelo codegen (useEquipmentsQuery, useCreateEquipmentMutation, etc.)
- [x] 2.10 Migrar hook useMaintenance → hooks gerados pelo codegen
- [x] 2.11 Migrar hook useWarranty → hooks gerados pelo codegen
- [x] 2.12 Migrar hook useParking → hooks gerados pelo codegen; adaptar para tipo LotterySession
- [x] 2.13 Migrar hook useBrigadiers → hooks gerados pelo codegen
- [x] 2.14 Migrar NotificationContext para usar query GraphQL de notificações
- [x] 2.15 Remover src/services/ (auth.service.ts, brigadier.service.ts, equipment.service.ts, maintenance.service.ts, parking.service.ts, warranty.service.ts, http.client.ts)
- [x] 2.16 Remover src/types/ manuais (auth.types.ts, brigadier.types.ts, equipment.types.ts, maintenance.types.ts, parking.types.ts, warranty.types.ts, notification.types.ts)
- [x] 2.17 Atualizar imports em todas as páginas/components para usar types gerados
- [x] 2.18 Manter fallback mock data em src/app/data/appData.ts quando VITE_API_BASE_URL vazio
- [x] 2.19 Validar que frontend compila e funciona com BFF mockado (VITE_API_BASE_URL apontando para BFF)
- [x] 2.20 Validar que frontend continua funcionando em modo mock (VITE_API_BASE_URL vazio)

## 3. Fase C.1 — equipmap-core (Shared Lib)

- [x] 3.1 Criar repositório `equipmap-core` com Gradle Kotlin DSL + Java 21
- [x] 3.2 Definir DTOs de eventos: MaintenanceCompletedEvent, MaintenanceOverdueEvent, WarrantyExpiringEvent, WarrantyExpiredEvent, BrigadierNotificationRequestedEvent
- [x] 3.3 Definir interface StorageService (generatePresignedUrl, validateMimeType, etc.)
- [x] 3.4 Definir interface MessagingProvider (send, getDeliveryStatus)
- [x] 3.5 Implementar classes de erro padronizadas (RFC 7807 simplificado)
- [x] 3.6 Definir constantes compartilhadas (nomes de filas RabbitMQ, routing keys, exchange names)
- [x] 3.7 Configurar publicação via GitHub Packages (Maven registry)
- [x] 3.8 Documentar uso via Gradle composite build para dev local

## 4. Fase C.2 — auth-service

- [x] 4.1 Criar repositório `auth-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 4.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [x] 4.3 Criar Flyway migrations: tabelas User, RefreshToken, schema base
- [x] 4.4 Criar Flyway seed migration: 1 admin user + associação com condomínio seed (email/password via env vars)
- [x] 4.5 Implementar JPA entities: User, RefreshToken
- [x] 4.6 Implementar POST /auth/login (validação BCrypt cost 12+, geração JWT com claims)
- [x] 4.7 Implementar POST /auth/refresh (httpOnly cookie, rotação, detecção de reuso → revogação de família)
- [x] 4.8 Implementar POST /auth/logout (invalidar refresh token)
- [x] 4.9 Implementar GET /auth/me (retornar perfil + lista de condomínios do usuário)
- [x] 4.10 Implementar POST /auth/switch-condominium (validar pertencimento, emitir novo par de tokens)
- [x] 4.11 Implementar POST /auth/social/google (OAuth 2.0 Authorization Code Flow)
- [x] 4.12 Implementar POST /auth/social/microsoft (OAuth 2.0 Authorization Code Flow)
- [x] 4.13 Implementar Spring Security filter para validação JWT
- [x] 4.14 Implementar RBAC (admin, manager, viewer) com annotations de autorização
- [x] 4.15 Implementar logs de auditoria para tentativas cross-tenant
- [x] 4.16 Criar testes unitários e de integração
- [x] 4.17 Documentar endpoints via OpenAPI/Swagger

## 5. Fase C.3 — condominium-service

- [x] 5.1 Criar repositório `condominium-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 5.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [x] 5.3 Criar Flyway migrations: tabelas Condominium, CondominiumUser
- [x] 5.4 Criar Flyway seed migration: 1 condomínio inicial
- [x] 5.5 Implementar JPA entities: Condominium, CondominiumUser
- [x] 5.6 Implementar CRUD REST: GET/POST/PUT/DELETE /condominiums
- [x] 5.7 Implementar associação de usuários: GET/POST/DELETE /condominiums/:id/users
- [x] 5.8 Implementar filtro de listagem por role (admin vê todos, demais veem apenas os seus)
- [x] 5.9 Implementar validação de CNPJ único
- [x] 5.10 Implementar bloqueio de exclusão com dependências ativas
- [x] 5.11 Implementar bloqueio de remoção do último admin
- [x] 5.12 Implementar validação de timezone
- [x] 5.13 Criar testes unitários e de integração
- [x] 5.14 Documentar endpoints via OpenAPI/Swagger

## 6. Fase C.4 — equipment-service

- [x] 6.1 Criar repositório `equipment-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 6.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [x] 6.3 Criar Flyway migrations: tabelas Equipment, OutboxEvent
- [x] 6.4 Implementar JPA entities: Equipment (com soft delete via deletedAt), OutboxEvent
- [x] 6.5 Implementar CRUD REST: GET/POST/PUT/DELETE /equipment com filtros e paginação (Spring Data Pageable)
- [x] 6.6 Implementar geração automática e unicidade de patrimonyCode por condomínio
- [x] 6.7 Implementar soft delete (campo deletedAt + Hibernate filter)
- [x] 6.8 Implementar Transactional Outbox Pattern (tabela outbox_events + polling)
- [x] 6.9 Implementar publicação de evento equipment.maintenance_due
- [x] 6.10 Implementar publicação de evento equipment.warranty_expiring
- [x] 6.11 Implementar consumo de evento maintenance.completed (atualizar lastMaintenance)
- [x] 6.12 Implementar status automático ALERT quando nextMaintenance está vencido
- [x] 6.13 Implementar validações (nextMaintenance >= acquisitionDate, value >= 0)
- [x] 6.14 Criar testes unitários e de integração
- [x] 6.15 Documentar endpoints via OpenAPI/Swagger

## 7. Fase C.5 — maintenance-service

- [x] 7.1 Criar repositório `maintenance-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 7.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [x] 7.3 Criar Flyway migrations: tabela MaintenanceRecord, OutboxEvent
- [x] 7.4 Implementar JPA entity: MaintenanceRecord (com @Version para optimistic locking)
- [x] 7.5 Implementar CRUD REST: GET/POST/PUT/DELETE /maintenance com filtros e paginação
- [x] 7.6 Implementar PATCH /maintenance/:id/complete com validação de completedDate por tipo
- [x] 7.7 Implementar optimistic locking na conclusão (409 em conflito)
- [x] 7.8 Implementar publicação de evento maintenance.completed via outbox
- [x] 7.9 Implementar job @Scheduled diário: marcar manutenções como OVERDUE (idempotente, timezone-aware)
- [x] 7.10 Implementar publicação de evento maintenance.overdue
- [x] 7.11 Criar testes unitários e de integração (incluindo teste de idempotência do job)
- [x] 7.12 Documentar endpoints via OpenAPI/Swagger

## 8. Fase C.6 — warranty-service

- [x] 8.1 Criar repositório `warranty-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 8.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + MinIO + service)
- [x] 8.3 Criar Flyway migrations: tabela Warranty, OutboxEvent
- [x] 8.4 Implementar JPA entity: Warranty (com status calculado dinamicamente)
- [x] 8.5 Implementar CRUD REST: GET/POST/PUT/DELETE /warranties com filtros e paginação
- [x] 8.6 Implementar POST /warranties/:id/upload-url (gerar pre-signed URL via StorageService)
- [x] 8.7 Implementar POST /warranties/:id/confirm-upload (validar MIME type real, vincular documento)
- [x] 8.8 Implementar validação: tipos permitidos (PDF, JPG, JPEG, PNG), max 10MB
- [x] 8.9 Implementar job @Scheduled diário: warranty.expiring (90 dias) e warranty.expired
- [x] 8.10 Implementar deduplicação de eventos (type + resourceId + condominiumId)
- [x] 8.11 Implementar interface StorageService com implementação S3-compatible (MinIO)
- [x] 8.12 Criar testes unitários e de integração
- [x] 8.13 Documentar endpoints via OpenAPI/Swagger

## 9. Fase C.7 — parking-service

- [x] 9.1 Criar repositório `parking-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 9.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [x] 9.3 Criar Flyway migrations: tabelas Apartment, ParkingSpot, LotterySession, LotteryResult
- [x] 9.4 Implementar JPA entities: Apartment, ParkingSpot, LotterySession, LotteryResult
- [x] 9.5 Implementar CRUD REST para apartamentos: GET/POST/PUT/DELETE /parking/apartments
- [x] 9.6 Implementar CRUD REST para vagas: GET/POST/PUT/DELETE /parking/spots
- [x] 9.7 Implementar POST /parking/lottery (Fisher-Yates + java.util.Random(seed), @Transactional SERIALIZABLE)
- [x] 9.8 Implementar tratamento de excedente (apt > vagas → sorteio parcial + undrawnApartments)
- [x] 9.9 Implementar DELETE /parking/lottery (reset, admin only)
- [x] 9.10 Implementar validações pré-sorteio (elegíveis > 0, vagas > 0)
- [x] 9.11 Implementar persistência de snapshot completo em LotteryResult
- [x] 9.12 Criar testes: reprodutibilidade com mesmo seed, atomicidade, concorrência
- [x] 9.13 Documentar endpoints via OpenAPI/Swagger

## 10. Fase C.8 — brigadier-service

- [x] 10.1 Criar repositório `brigadier-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 10.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [x] 10.3 Criar Flyway migrations: tabelas Brigadier, NotificationLog
- [x] 10.4 Implementar JPA entities: Brigadier, NotificationLog
- [x] 10.5 Implementar CRUD REST: GET/POST/PUT/DELETE /brigadiers com filtros (nome, função, status)
- [x] 10.6 Implementar cálculo dinâmico de status de certificação (EXPIRING em 90 dias, EXPIRED)
- [x] 10.7 Implementar POST /brigadiers/notify (validação + enfileiramento via RabbitMQ)
- [x] 10.8 Implementar @RabbitListener worker: processar envio individual, criar NotificationLog por destinatário
- [x] 10.9 Implementar filtro silencioso de brigadistas inativos
- [x] 10.10 Implementar MessagingProvider mock/sandbox (Strategy Pattern via Spring DI)
- [x] 10.11 Implementar retry via dead-letter queue
- [x] 10.12 Implementar GET /brigadiers/notify/logs
- [x] 10.13 Criar testes unitários e de integração
- [x] 10.14 Documentar endpoints via OpenAPI/Swagger

## 11. Fase C.9 — notification-service

- [x] 11.1 Criar repositório `notification-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [x] 11.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [x] 11.3 Criar Flyway migrations: tabela Notification (com campos de deduplicação)
- [x] 11.4 Implementar JPA entity: Notification (com unique constraint condicional para deduplicação)
- [x] 11.5 Implementar @RabbitListener para eventos: maintenance.overdue, maintenance_pending, warranty.expiring, warranty.expired
- [x] 11.6 Implementar mapeamento de severidade (overdue/expired → high, pending/expiring → medium)
- [x] 11.7 Implementar deduplicação por chave: type + resourceId + userId + condominiumId
- [x] 11.8 Implementar GET /notifications (filtrado por userId e condominiumId do JWT)
- [x] 11.9 Implementar PATCH /notifications/:id/read e PATCH /notifications/read-all
- [x] 11.10 Implementar DELETE /notifications/:id (exclusão lógica pessoal, 403 se outro usuário)
- [x] 11.11 Implementar AcknowledgeMode.MANUAL + persistent messages
- [x] 11.12 Criar testes unitários e de integração
- [x] 11.13 Documentar endpoints via OpenAPI/Swagger

## 12. Fase C.10 — BFF Ajustado para Backend Real

- [x] 12.1 Criar data sources no BFF para cada microserviço (REST clients com base URL configurável)
- [x] 12.2 Substituir resolver mock de auth por chamadas REST ao auth-service
- [x] 12.3 Substituir resolver mock de condominium por chamadas REST ao condominium-service
- [x] 12.4 Substituir resolver mock de equipment por chamadas REST ao equipment-service
- [x] 12.5 Substituir resolver mock de maintenance por chamadas REST ao maintenance-service
- [x] 12.6 Substituir resolver mock de warranty por chamadas REST ao warranty-service
- [x] 12.7 Substituir resolver mock de parking por chamadas REST ao parking-service
- [x] 12.8 Substituir resolver mock de brigadier por chamadas REST ao brigadier-service
- [x] 12.9 Substituir resolver mock de notification por chamadas REST ao notification-service
- [x] 12.10 Implementar DataLoader para chamadas paralelas quando possível
- [x] 12.11 Implementar tratamento de falhas parciais (serviço indisponível → null + error no array errors)
- [x] 12.12 Implementar propagação de traceId para microserviços
- [x] 12.13 Validar contract tests BFF ↔ microserviços
- [x] 12.14 Testar BFF com serviços reais rodando via Docker Compose

## 13. Fase C.11 — Infraestrutura e Homologação

- [x] 13.1 Criar repositório `equipmap-infra` com Docker Compose de orquestração completa
- [x] 13.2 Configurar docker-compose.yml com todos os serviços + PostgreSQL + RabbitMQ + MinIO
- [x] 13.3 Configurar variáveis de ambiente para todos os serviços (12-factor)
- [x] 13.4 Validar fluxo end-to-end: login → seleção de condomínio → CRUD equipamentos → manutenção → garantias → notificações
- [x] 13.5 Validar fluxo de sorteio de vagas end-to-end
- [x] 13.6 Validar fluxo de brigadistas e envio em massa end-to-end
- [x] 13.7 Validar RBAC por perfil (admin, manager, viewer)
- [x] 13.8 Validar isolamento multi-tenant (condominiumId no JWT)
- [x] 13.9 Validar jobs diários (idempotência, timezone)
- [x] 13.10 Validar resiliência RabbitMQ (DLQ, reprocessamento)
- [x] 13.11 Validar p95 latência ≤ 500ms para queries simples
- [x] 13.12 Registrar pendências para versão pós-MVP
