## Why

O EquipMap opera exclusivamente com dados mockados. Sem backend real, o sistema não pode persistir dados, autenticar usuários, executar regras de negócio automáticas nem operar em ambiente produtivo. Os 8 domínios funcionais (auth, condomínios, equipamentos, manutenção, garantias, sorteio de vagas, brigadistas e notificações) precisam de implementação completa para viabilizar operação real em múltiplos condomínios.

A implementação segue 3 fases sequenciais: (1) BFF GraphQL com resolvers mockados, (2) frontend migrado para consumir o BFF via Apollo Client + graphql-codegen, (3) microserviços Java implementados com BFF ajustado para chamadas reais.

## What Changes

- Criar BFF Node.js + Apollo Server com schema GraphQL completo e resolvers mockados (fase 1)
- Migrar frontend de dados locais/services manuais para Apollo Client consumindo BFF GraphQL (fase 2)
- Configurar `graphql-codegen` para gerar types TypeScript a partir do schema, substituindo `src/types/` manuais (fase 2)
- Implementar `equipmap-core` (shared lib Java) com DTOs de eventos, interfaces e constantes (fase 3)
- Implementar `auth-service` com login, refresh token (httpOnly cookie + rotação), RBAC e switch de condomínio (fase 3)
- Implementar `condominium-service` com CRUD e associação de usuários (fase 3)
- Implementar `equipment-service` com CRUD, soft delete, patrimonyCode único e Transactional Outbox (fase 3)
- Implementar `maintenance-service` com CRUD, conclusão, jobs diários e eventos (fase 3)
- Implementar `warranty-service` com CRUD, upload via pre-signed URL (MinIO) e jobs de vencimento (fase 3)
- Implementar `parking-service` com sorteio atômico, seed auditável e tratamento de excedentes (fase 3)
- Implementar `brigadier-service` com CRUD e envio assíncrono de mensagens via RabbitMQ (fase 3)
- Implementar `notification-service` com consumo de eventos, deduplicação e exclusão lógica pessoal (fase 3)
- Ajustar BFF para rotear para microserviços reais em vez de mocks (fase 3)
- Configurar `equipmap-infra` com Docker Compose de orquestração para ambiente local (fase 3)
- Homologar fluxo completo end-to-end com frontend real (fase 3)

## Capabilities

### New Capabilities

- `bff-graphql`: BFF Node.js + Apollo Server — schema GraphQL, JWT validation, rate limiting, CORS, resolvers (mock → real)
- `auth-service`: Autenticação com email/senha e social login, JWT com claims, refresh token httpOnly, RBAC, switch de condomínio
- `condominium-service`: CRUD de condomínios, associação de usuários, timezone parametrizável, multi-tenancy
- `equipment-service`: CRUD de equipamentos, patrimonyCode único por condomínio, soft delete, Transactional Outbox
- `maintenance-service`: CRUD de manutenções, conclusão com optimistic locking, jobs diários, eventos assíncronos
- `warranty-service`: CRUD de garantias, upload de documentos via pre-signed URL (MinIO), jobs de vencimento
- `parking-service`: Sorteio atômico de vagas com seed registrado, Fisher-Yates, tratamento de excedentes
- `brigadier-service`: CRUD de brigadistas, envio assíncrono de mensagens em massa via RabbitMQ, retry com DLQ
- `notification-service`: Consumo de eventos, geração de alertas, deduplicação, exclusão lógica pessoal
- `equipmap-core`: Shared lib Java — DTOs de eventos, interfaces (StorageService, MessagingProvider), constantes
- `frontend-migration`: Migração do frontend para Apollo Client + graphql-codegen, remoção de types manuais

### Modified Capabilities

_(nenhuma — não existem specs anteriores)_

## Impact

- **Frontend (`fe-equipmap`)**: substituição completa da camada de services/types por Apollo Client + codegen; novo AuthContext GraphQL; nova tela de seleção de condomínio
- **Novos repositórios**: 11 repos criados (bff-equipmap, auth-service, condominium-service, equipment-service, maintenance-service, warranty-service, parking-service, brigadier-service, notification-service, equipmap-core, equipmap-infra)
- **APIs**: schema GraphQL público (frontend → BFF); contratos REST internos (BFF → microserviços) documentados via OpenAPI
- **Infraestrutura**: PostgreSQL (1 DB por serviço), RabbitMQ, MinIO, Docker Compose por repo
- **Dependências novas**: Apollo Client, @apollo/server, graphql-codegen, Spring Boot 3.x, Spring Data JPA, Spring AMQP, Spring Security, Flyway, Gradle
- **Breaking changes**: types em `src/types/` serão substituídos por codegen (imports mudam); services em `src/services/` substituídos por hooks Apollo
