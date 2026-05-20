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

- [ ] 2.1 Instalar Apollo Client, @apollo/client, graphql no fe-equipmap
- [ ] 2.2 Instalar e configurar @graphql-codegen/cli com plugins (typescript, typescript-operations, typescript-react-apollo)
- [ ] 2.3 Configurar codegen.yml apontando para schema.graphql do BFF
- [ ] 2.4 Gerar types e hooks iniciais via codegen
- [ ] 2.5 Criar ApolloProvider com auth link (JWT no header Authorization) e error link
- [ ] 2.6 Implementar token refresh automático via Apollo Link (intercepta 401, tenta refresh, retry)
- [ ] 2.7 Migrar AuthContext para usar mutations GraphQL (login, logout, refresh, switchCondominium, me)
- [ ] 2.8 Implementar tela de seleção de condomínio (pós-login, multi-tenancy)
- [ ] 2.9 Migrar hook useEquipment → hooks gerados pelo codegen (useEquipmentsQuery, useCreateEquipmentMutation, etc.)
- [ ] 2.10 Migrar hook useMaintenance → hooks gerados pelo codegen
- [ ] 2.11 Migrar hook useWarranty → hooks gerados pelo codegen
- [ ] 2.12 Migrar hook useParking → hooks gerados pelo codegen; adaptar para tipo LotterySession
- [ ] 2.13 Migrar hook useBrigadiers → hooks gerados pelo codegen
- [ ] 2.14 Migrar NotificationContext para usar query GraphQL de notificações
- [ ] 2.15 Remover src/services/ (auth.service.ts, brigadier.service.ts, equipment.service.ts, maintenance.service.ts, parking.service.ts, warranty.service.ts, http.client.ts)
- [ ] 2.16 Remover src/types/ manuais (auth.types.ts, brigadier.types.ts, equipment.types.ts, maintenance.types.ts, parking.types.ts, warranty.types.ts, notification.types.ts)
- [ ] 2.17 Atualizar imports em todas as páginas/components para usar types gerados
- [ ] 2.18 Manter fallback mock data em src/app/data/appData.ts quando VITE_API_BASE_URL vazio
- [ ] 2.19 Validar que frontend compila e funciona com BFF mockado (VITE_API_BASE_URL apontando para BFF)
- [ ] 2.20 Validar que frontend continua funcionando em modo mock (VITE_API_BASE_URL vazio)

## 3. Fase C.1 — equipmap-core (Shared Lib)

- [ ] 3.1 Criar repositório `equipmap-core` com Gradle Kotlin DSL + Java 21
- [ ] 3.2 Definir DTOs de eventos: MaintenanceCompletedEvent, MaintenanceOverdueEvent, WarrantyExpiringEvent, WarrantyExpiredEvent, BrigadierNotificationRequestedEvent
- [ ] 3.3 Definir interface StorageService (generatePresignedUrl, validateMimeType, etc.)
- [ ] 3.4 Definir interface MessagingProvider (send, getDeliveryStatus)
- [ ] 3.5 Implementar classes de erro padronizadas (RFC 7807 simplificado)
- [ ] 3.6 Definir constantes compartilhadas (nomes de filas RabbitMQ, routing keys, exchange names)
- [ ] 3.7 Configurar publicação via GitHub Packages (Maven registry)
- [ ] 3.8 Documentar uso via Gradle composite build para dev local

## 4. Fase C.2 — auth-service

- [ ] 4.1 Criar repositório `auth-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 4.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [ ] 4.3 Criar Flyway migrations: tabelas User, RefreshToken, schema base
- [ ] 4.4 Criar Flyway seed migration: 1 admin user + associação com condomínio seed (email/password via env vars)
- [ ] 4.5 Implementar JPA entities: User, RefreshToken
- [ ] 4.6 Implementar POST /auth/login (validação BCrypt cost 12+, geração JWT com claims)
- [ ] 4.7 Implementar POST /auth/refresh (httpOnly cookie, rotação, detecção de reuso → revogação de família)
- [ ] 4.8 Implementar POST /auth/logout (invalidar refresh token)
- [ ] 4.9 Implementar GET /auth/me (retornar perfil + lista de condomínios do usuário)
- [ ] 4.10 Implementar POST /auth/switch-condominium (validar pertencimento, emitir novo par de tokens)
- [ ] 4.11 Implementar POST /auth/social/google (OAuth 2.0 Authorization Code Flow)
- [ ] 4.12 Implementar POST /auth/social/microsoft (OAuth 2.0 Authorization Code Flow)
- [ ] 4.13 Implementar Spring Security filter para validação JWT
- [ ] 4.14 Implementar RBAC (admin, manager, viewer) com annotations de autorização
- [ ] 4.15 Implementar logs de auditoria para tentativas cross-tenant
- [ ] 4.16 Criar testes unitários e de integração
- [ ] 4.17 Documentar endpoints via OpenAPI/Swagger

## 5. Fase C.3 — condominium-service

- [ ] 5.1 Criar repositório `condominium-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 5.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [ ] 5.3 Criar Flyway migrations: tabelas Condominium, CondominiumUser
- [ ] 5.4 Criar Flyway seed migration: 1 condomínio inicial
- [ ] 5.5 Implementar JPA entities: Condominium, CondominiumUser
- [ ] 5.6 Implementar CRUD REST: GET/POST/PUT/DELETE /condominiums
- [ ] 5.7 Implementar associação de usuários: GET/POST/DELETE /condominiums/:id/users
- [ ] 5.8 Implementar filtro de listagem por role (admin vê todos, demais veem apenas os seus)
- [ ] 5.9 Implementar validação de CNPJ único
- [ ] 5.10 Implementar bloqueio de exclusão com dependências ativas
- [ ] 5.11 Implementar bloqueio de remoção do último admin
- [ ] 5.12 Implementar validação de timezone
- [ ] 5.13 Criar testes unitários e de integração
- [ ] 5.14 Documentar endpoints via OpenAPI/Swagger

## 6. Fase C.4 — equipment-service

- [ ] 6.1 Criar repositório `equipment-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 6.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [ ] 6.3 Criar Flyway migrations: tabelas Equipment, OutboxEvent
- [ ] 6.4 Implementar JPA entities: Equipment (com soft delete via deletedAt), OutboxEvent
- [ ] 6.5 Implementar CRUD REST: GET/POST/PUT/DELETE /equipment com filtros e paginação (Spring Data Pageable)
- [ ] 6.6 Implementar geração automática e unicidade de patrimonyCode por condomínio
- [ ] 6.7 Implementar soft delete (campo deletedAt + Hibernate filter)
- [ ] 6.8 Implementar Transactional Outbox Pattern (tabela outbox_events + polling)
- [ ] 6.9 Implementar publicação de evento equipment.maintenance_due
- [ ] 6.10 Implementar publicação de evento equipment.warranty_expiring
- [ ] 6.11 Implementar consumo de evento maintenance.completed (atualizar lastMaintenance)
- [ ] 6.12 Implementar status automático ALERT quando nextMaintenance está vencido
- [ ] 6.13 Implementar validações (nextMaintenance >= acquisitionDate, value >= 0)
- [ ] 6.14 Criar testes unitários e de integração
- [ ] 6.15 Documentar endpoints via OpenAPI/Swagger

## 7. Fase C.5 — maintenance-service

- [ ] 7.1 Criar repositório `maintenance-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 7.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [ ] 7.3 Criar Flyway migrations: tabela MaintenanceRecord, OutboxEvent
- [ ] 7.4 Implementar JPA entity: MaintenanceRecord (com @Version para optimistic locking)
- [ ] 7.5 Implementar CRUD REST: GET/POST/PUT/DELETE /maintenance com filtros e paginação
- [ ] 7.6 Implementar PATCH /maintenance/:id/complete com validação de completedDate por tipo
- [ ] 7.7 Implementar optimistic locking na conclusão (409 em conflito)
- [ ] 7.8 Implementar publicação de evento maintenance.completed via outbox
- [ ] 7.9 Implementar job @Scheduled diário: marcar manutenções como OVERDUE (idempotente, timezone-aware)
- [ ] 7.10 Implementar publicação de evento maintenance.overdue
- [ ] 7.11 Criar testes unitários e de integração (incluindo teste de idempotência do job)
- [ ] 7.12 Documentar endpoints via OpenAPI/Swagger

## 8. Fase C.6 — warranty-service

- [ ] 8.1 Criar repositório `warranty-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 8.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + MinIO + service)
- [ ] 8.3 Criar Flyway migrations: tabela Warranty, OutboxEvent
- [ ] 8.4 Implementar JPA entity: Warranty (com status calculado dinamicamente)
- [ ] 8.5 Implementar CRUD REST: GET/POST/PUT/DELETE /warranties com filtros e paginação
- [ ] 8.6 Implementar POST /warranties/:id/upload-url (gerar pre-signed URL via StorageService)
- [ ] 8.7 Implementar POST /warranties/:id/confirm-upload (validar MIME type real, vincular documento)
- [ ] 8.8 Implementar validação: tipos permitidos (PDF, JPG, JPEG, PNG), max 10MB
- [ ] 8.9 Implementar job @Scheduled diário: warranty.expiring (90 dias) e warranty.expired
- [ ] 8.10 Implementar deduplicação de eventos (type + resourceId + condominiumId)
- [ ] 8.11 Implementar interface StorageService com implementação S3-compatible (MinIO)
- [ ] 8.12 Criar testes unitários e de integração
- [ ] 8.13 Documentar endpoints via OpenAPI/Swagger

## 9. Fase C.7 — parking-service

- [ ] 9.1 Criar repositório `parking-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 9.2 Configurar Docker Compose autossuficiente (PostgreSQL + service)
- [ ] 9.3 Criar Flyway migrations: tabelas Apartment, ParkingSpot, LotterySession, LotteryResult
- [ ] 9.4 Implementar JPA entities: Apartment, ParkingSpot, LotterySession, LotteryResult
- [ ] 9.5 Implementar CRUD REST para apartamentos: GET/POST/PUT/DELETE /parking/apartments
- [ ] 9.6 Implementar CRUD REST para vagas: GET/POST/PUT/DELETE /parking/spots
- [ ] 9.7 Implementar POST /parking/lottery (Fisher-Yates + java.util.Random(seed), @Transactional SERIALIZABLE)
- [ ] 9.8 Implementar tratamento de excedente (apt > vagas → sorteio parcial + undrawnApartments)
- [ ] 9.9 Implementar DELETE /parking/lottery (reset, admin only)
- [ ] 9.10 Implementar validações pré-sorteio (elegíveis > 0, vagas > 0)
- [ ] 9.11 Implementar persistência de snapshot completo em LotteryResult
- [ ] 9.12 Criar testes: reprodutibilidade com mesmo seed, atomicidade, concorrência
- [ ] 9.13 Documentar endpoints via OpenAPI/Swagger

## 10. Fase C.8 — brigadier-service

- [ ] 10.1 Criar repositório `brigadier-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 10.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [ ] 10.3 Criar Flyway migrations: tabelas Brigadier, NotificationLog
- [ ] 10.4 Implementar JPA entities: Brigadier, NotificationLog
- [ ] 10.5 Implementar CRUD REST: GET/POST/PUT/DELETE /brigadiers com filtros (nome, função, status)
- [ ] 10.6 Implementar cálculo dinâmico de status de certificação (EXPIRING em 90 dias, EXPIRED)
- [ ] 10.7 Implementar POST /brigadiers/notify (validação + enfileiramento via RabbitMQ)
- [ ] 10.8 Implementar @RabbitListener worker: processar envio individual, criar NotificationLog por destinatário
- [ ] 10.9 Implementar filtro silencioso de brigadistas inativos
- [ ] 10.10 Implementar MessagingProvider mock/sandbox (Strategy Pattern via Spring DI)
- [ ] 10.11 Implementar retry via dead-letter queue
- [ ] 10.12 Implementar GET /brigadiers/notify/logs
- [ ] 10.13 Criar testes unitários e de integração
- [ ] 10.14 Documentar endpoints via OpenAPI/Swagger

## 11. Fase C.9 — notification-service

- [ ] 11.1 Criar repositório `notification-service` com Spring Boot + Gradle Kotlin DSL + Java 21
- [ ] 11.2 Configurar Docker Compose autossuficiente (PostgreSQL + RabbitMQ + service)
- [ ] 11.3 Criar Flyway migrations: tabela Notification (com campos de deduplicação)
- [ ] 11.4 Implementar JPA entity: Notification (com unique constraint condicional para deduplicação)
- [ ] 11.5 Implementar @RabbitListener para eventos: maintenance.overdue, maintenance_pending, warranty.expiring, warranty.expired
- [ ] 11.6 Implementar mapeamento de severidade (overdue/expired → high, pending/expiring → medium)
- [ ] 11.7 Implementar deduplicação por chave: type + resourceId + userId + condominiumId
- [ ] 11.8 Implementar GET /notifications (filtrado por userId e condominiumId do JWT)
- [ ] 11.9 Implementar PATCH /notifications/:id/read e PATCH /notifications/read-all
- [ ] 11.10 Implementar DELETE /notifications/:id (exclusão lógica pessoal, 403 se outro usuário)
- [ ] 11.11 Implementar AcknowledgeMode.MANUAL + persistent messages
- [ ] 11.12 Criar testes unitários e de integração
- [ ] 11.13 Documentar endpoints via OpenAPI/Swagger

## 12. Fase C.10 — BFF Ajustado para Backend Real

- [ ] 12.1 Criar data sources no BFF para cada microserviço (REST clients com base URL configurável)
- [ ] 12.2 Substituir resolver mock de auth por chamadas REST ao auth-service
- [ ] 12.3 Substituir resolver mock de condominium por chamadas REST ao condominium-service
- [ ] 12.4 Substituir resolver mock de equipment por chamadas REST ao equipment-service
- [ ] 12.5 Substituir resolver mock de maintenance por chamadas REST ao maintenance-service
- [ ] 12.6 Substituir resolver mock de warranty por chamadas REST ao warranty-service
- [ ] 12.7 Substituir resolver mock de parking por chamadas REST ao parking-service
- [ ] 12.8 Substituir resolver mock de brigadier por chamadas REST ao brigadier-service
- [ ] 12.9 Substituir resolver mock de notification por chamadas REST ao notification-service
- [ ] 12.10 Implementar DataLoader para chamadas paralelas quando possível
- [ ] 12.11 Implementar tratamento de falhas parciais (serviço indisponível → null + error no array errors)
- [ ] 12.12 Implementar propagação de traceId para microserviços
- [ ] 12.13 Validar contract tests BFF ↔ microserviços
- [ ] 12.14 Testar BFF com serviços reais rodando via Docker Compose

## 13. Fase C.11 — Infraestrutura e Homologação

- [ ] 13.1 Criar repositório `equipmap-infra` com Docker Compose de orquestração completa
- [ ] 13.2 Configurar docker-compose.yml com todos os serviços + PostgreSQL + RabbitMQ + MinIO
- [ ] 13.3 Configurar variáveis de ambiente para todos os serviços (12-factor)
- [ ] 13.4 Validar fluxo end-to-end: login → seleção de condomínio → CRUD equipamentos → manutenção → garantias → notificações
- [ ] 13.5 Validar fluxo de sorteio de vagas end-to-end
- [ ] 13.6 Validar fluxo de brigadistas e envio em massa end-to-end
- [ ] 13.7 Validar RBAC por perfil (admin, manager, viewer)
- [ ] 13.8 Validar isolamento multi-tenant (condominiumId no JWT)
- [ ] 13.9 Validar jobs diários (idempotência, timezone)
- [ ] 13.10 Validar resiliência RabbitMQ (DLQ, reprocessamento)
- [ ] 13.11 Validar p95 latência ≤ 500ms para queries simples
- [ ] 13.12 Registrar pendências para versão pós-MVP
