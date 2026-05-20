## Context

O EquipMap possui frontend React 18 + TypeScript completo com dados mockados. A variável `VITE_API_BASE_URL` controla se o frontend usa mocks (vazio) ou backend real (preenchido). A arquitetura definida no PRD consiste em 12 repositórios: 1 frontend, 1 BFF GraphQL (Node.js), 8 microserviços Java 21 + Spring Boot, 1 shared lib (`equipmap-core`) e 1 infra (`equipmap-infra`).

A implementação segue **3 fases** para garantir entrega incremental e validação contínua:

1. **Fase A — BFF Mockado**: BFF Node.js + Apollo Server com schema GraphQL completo e resolvers retornando dados estáticos/faker. Permite ao frontend migrar sem depender de microserviços.
2. **Fase B — Frontend Migrado**: Frontend adaptado para consumir BFF via Apollo Client + graphql-codegen. Types manuais removidos, hooks reescritos.
3. **Fase C — Backend Real**: Microserviços Java implementados progressivamente (auth → condominium → equipment → maintenance → warranty → parking → brigadier → notification). BFF ajustado para rotear chamadas reais.

## Goals / Non-Goals

**Goals:**
- Entregar BFF funcional (mock) em isolamento, validável sem backend Java
- Migrar frontend para GraphQL antes dos serviços existirem, usando BFF mockado como contrato
- Implementar microserviços Java com deploy independente por repo
- Manter frontend funcional em modo mock (fallback) durante toda a migração
- Homologar fluxo end-to-end completo ao final

**Non-Goals:**
- Monorepo (decidido por 12 repos independentes)
- Deploy em produção/cloud durante o MVP (apenas homologação local/staging)
- Integração real com provedores WhatsApp/SMS (mock/sandbox)
- Aplicativo mobile
- Migração de dados legados

## Decisions

### D1: Fases de implementação (BFF mock → Frontend → Backend → BFF real)

**Decisão**: Implementar em 3 fases sequenciais em vez de vertical slices por feature.

**Alternativas consideradas**:
- Vertical slice por milestone (BFF + backend + frontend juntos por domínio) — rejeitado: frontend ficaria bloqueado até backend Java estar pronto
- Frontend e backend em paralelo com contract tests — rejeitado: exige coordenação excessiva entre times

**Rationale**: BFF mockado serve como contrato estável. Frontend migra uma vez, backend implementa sem pressão do frontend, BFF ajusta resolvers quando serviços ficam prontos.

### D2: Apollo Client + graphql-codegen no frontend

**Decisão**: Substituir toda a camada `src/services/` e `src/types/` por Apollo Client hooks gerados via `graphql-codegen`.

**Alternativas consideradas**:
- urql — rejeitado: menor ecossistema, menos documentação para features enterprise (cache normalization)
- Manter services manuais com fetch GraphQL — rejeitado: perde type-safety e cache automático

**Rationale**: Apollo Client oferece cache normalizado, optimistic updates, polling/subscriptions futuras. Codegen garante sincronia schema↔tipos sem esforço manual.

### D3: Schema GraphQL como source of truth

**Decisão**: O schema `.graphql` do BFF é o contrato autoritativo. Frontend gera types dele; microserviços implementam o que ele demanda.

**Rationale**: Ponto único de verdade evita divergência. Mudanças no schema disparam regeneração no frontend e ajustes nos serviços.

### D4: Resolvers BFF — mock com mesma estrutura dos reais

**Decisão**: Resolvers mockados retornam dados com a mesma shape dos reais (usando faker/factory). Ao trocar para chamadas REST, apenas a data source muda.

**Rationale**: Frontend nunca percebe a transição mock→real. Testes de contrato validam a shape desde o dia 1.

### D5: Gradle Kotlin DSL + composite build para equipmap-core

**Decisão**: Todos os projetos Java usam Gradle com Kotlin DSL. `equipmap-core` é incluído via Gradle composite build em dev e publicado via GitHub Packages para CI.

**Alternativas consideradas**:
- Maven — rejeitado: XML verboso, sem composite build, builds mais lentos
- Incluir core como submódulo git — rejeitado: versionamento implícito, conflitos frequentes

**Rationale**: Composite build permite editar core e serviços simultaneamente sem publish. Em CI, versão publicada garante reprodutibilidade.

### D6: Docker Compose por microserviço (autossuficiente)

**Decisão**: Cada repo Java tem seu próprio `docker-compose.yml` com Postgres, RabbitMQ e dependências necessárias. `equipmap-infra` orquestra o ambiente completo.

**Alternativas consideradas**:
- Docker Compose centralizado único — rejeitado: exige clonar todos os repos; acoplamento operacional

**Rationale**: Dev pode trabalhar em um serviço isolado. Integração completa disponível via `equipmap-infra` quando necessário.

### D7: Enums limpos no GraphQL + mapping no BFF

**Decisão**: Enums GraphQL sem acentos/espaços (e.g., `CLIMATIZATION` em vez de `Climatização`). BFF mapeia para labels legíveis nos resolvers quando necessário.

**Rationale**: Type-safety em todas as camadas. Labels localizados são responsabilidade do frontend (i18n-ready).

### D8: Seed data via Flyway migration

**Decisão**: Primeiro migration do `auth-service` cria 1 usuário admin + associação com condomínio seed do `condominium-service`.

**Rationale**: Bootstrap mínimo para primeiro login sem setup manual. Ambiente de dev funcional desde o `docker compose up`.

### D9: Transactional Outbox Pattern para eventos críticos

**Decisão**: Serviços que publicam eventos (equipment, maintenance, warranty, brigadier) usam tabela `outbox_events` com polling/CDC para publicar no RabbitMQ.

**Alternativas consideradas**:
- Publish direto no RabbitMQ na mesma transação — rejeitado: falha parcial (commit DB + falha no broker) gera inconsistência

**Rationale**: Garante at-least-once delivery. Consumidores implementam idempotência via chave de deduplicação.

### D10: Contract tests em dev, integração real em staging

**Decisão**: Em dev, BFF testa contra mocks dos microserviços (contract tests). Em staging, testa contra serviços reais.

**Rationale**: Ciclo rápido em dev (sem subir 8 JVMs). Staging valida integrações reais antes de homologação.

## Risks / Trade-offs

- **BFF mockado pode divergir dos serviços reais** → Contract tests obrigatórios; OpenAPI spec gerada pelos serviços validada contra resolvers do BFF
- **12 repos = overhead de coordenação** → `equipmap-infra` como ponto de orquestração; CI valida contract tests cross-repo
- **graphql-codegen quebra se schema mudar** → CI no frontend roda codegen e falha se types gerados não compilam
- **Fase A (BFF mock) pode durar mais que o esperado** → Schema baseado nos types existentes em `src/types/` (blueprint já existe)
- **Complexidade de debugging cross-service** → traceId propagado em todos os headers; logs estruturados com correlação
- **equipmap-core como ponto de acoplamento** → Manter minimal (DTOs + interfaces); versionamento semântico com compatibilidade retroativa

## Migration Plan

1. **Fase A** — BFF mockado: criar `bff-equipmap` com schema completo, resolvers mock, JWT validation, rate limiting. Frontend continua em modo mock local.
2. **Fase B** — Frontend migrado: instalar Apollo Client + codegen no `fe-equipmap`; migrar AuthContext, hooks, remover types manuais. `VITE_API_BASE_URL` aponta para BFF.
3. **Fase C** — Backend real: implementar serviços por milestone (auth+condominium → equipment+maintenance → warranty+notification → parking → brigadier). A cada serviço pronto, ajustar resolver correspondente no BFF.
4. **Rollback**: Frontend mantém fallback para modo mock (data layer em `src/app/data/appData.ts`) até homologação completa.

## Open Questions

- Definição do provedor de registry Maven para `equipmap-core` (GitHub Packages vs. alternativa self-hosted)
- Estratégia de versionamento do schema GraphQL (breaking changes via deprecation vs. versionamento de schema)
- Ordem exata de implementação dentro da Fase C caso surjam dependências não previstas entre serviços
