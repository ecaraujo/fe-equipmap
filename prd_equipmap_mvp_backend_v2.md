---
prd_number: "001"
status: pronto
priority: alta
created: 2026-05-18
updated: 2026-05-20
issue: ""
depends_on: []
references:
  - "EquipMap — Gestão de Condomínios"
  - "Prompt de geração de PRD"
---

# PRD 001: Backend MVP e Integração Real da Plataforma EquipMap

## 1. Contexto

- **Sistema/produto**: EquipMap — aplicação web para gestão de condomínios residenciais, com foco em equipamentos, manutenções, garantias, sorteio de vagas de garagem, brigadistas e notificações operacionais. O frontend já está definido com React 18, TypeScript, Tailwind CSS v4, Vite, Radix UI/shadcn, motion/react, recharts e lucide-react.
- **Stack tecnológica**:
  - **Frontend**: React 18 + TypeScript + Vite + Apollo Client + `graphql-codegen` (types gerados a partir do schema GraphQL do BFF)
  - **BFF (Backend for Frontend)**: Node.js + Apollo Server (GraphQL) — ponto único de entrada do frontend; orquestra chamadas aos microserviços, aplica autenticação, resolve queries/mutations e mapeia enums
  - **Backend (microserviços)**: Java 21 (LTS) + Spring Boot + **Gradle** (Kotlin DSL), Spring Data JPA + Hibernate, **PostgreSQL** (um database por serviço), **RabbitMQ** como message broker (Spring AMQP), **MinIO** (S3-compatible) para storage de documentos
  - **Shared lib**: `equipmap-core` — DTOs de eventos, interfaces (StorageService, MessagingProvider), error handling, constantes. Publicado via Maven registry (GitHub Packages) + Gradle composite build para dev local
  - **Comunicação BFF → microserviços**: REST (HTTP), documentada via OpenAPI
  - **Infraestrutura**: agnóstica de cloud provider, Docker Compose **por microserviço** (cada repo autossuficiente), configuração via variáveis de ambiente (12-factor)
- **Repositórios** (12 repos isolados):
  - `fe-equipmap` — Frontend React + TypeScript (existente)
  - `bff-equipmap` — BFF Node.js + Apollo Server (GraphQL)
  - `auth-service` — Autenticação/autorização (Java/Spring Boot)
  - `condominium-service` — Gestão de condomínios (Java/Spring Boot)
  - `equipment-service` — Inventário de equipamentos (Java/Spring Boot)
  - `maintenance-service` — Manutenções (Java/Spring Boot)
  - `warranty-service` — Garantias + documentos (Java/Spring Boot)
  - `parking-service` — Sorteio de vagas (Java/Spring Boot)
  - `brigadier-service` — Brigadistas + comunicação (Java/Spring Boot)
  - `notification-service` — Alertas internos (Java/Spring Boot)
  - `equipmap-core` — Shared lib Java (DTOs, interfaces, constantes)
  - `equipmap-infra` — Docker Compose de integração + IaC
- **Estado atual**: o frontend usa Apollo Client e exige `VITE_API_BASE_URL` apontando para o BFF GraphQL. O runtime local integrado é BFF + microserviços reais via `equipmap-infra`; dados locais/mockados não são fallback suportado. Os contratos TypeScript são gerados via `graphql-codegen`. Existem 8 domínios de backend identificados como microserviços independentes: `auth-service`, `condominium-service`, `equipment-service`, `maintenance-service`, `warranty-service`, `parking-service`, `brigadier-service` e `notification-service`.
- **Multi-tenancy**: um usuário/proprietário pode possuir apartamentos em condomínios diferentes que utilizam o EquipMap. O `condominiumId` ativo é vinculado ao JWT (claim assinado), selecionado pós-login e trocável via mutation dedicada.
- **Problema**: a aplicação precisava deixar a fase de dados locais/mockados e operar contra backend real. Sem backend real, o EquipMap não consegue operar em ambiente produtivo, persistir dados por condomínio, aplicar autenticação/autorização, executar regras de negócio automáticas, controlar histórico operacional nem gerar notificações confiáveis. Os principais afetados são síndicos, administradores de condomínio, equipes de manutenção, brigadistas e gestores operacionais.
- **Impacto de não resolver**: a gestão de ativos, manutenções, garantias e comunicações continuará fragmentada em planilhas, controles manuais ou ferramentas desconectadas, aumentando o risco de manutenção vencida, perda de garantia, inconsistência em sorteios de vagas, falha de comunicação com brigadistas e ausência de rastreabilidade operacional.

Este PRD descreve a entrega do MVP backend integrado ao frontend existente, preservando os contratos esperados pela aplicação e criando uma base evolutiva para operação real em múltiplos condomínios.

## 2. Solução Proposta

### Visão geral

- Implementar um backend composto por 8 microserviços Java/Spring Boot independentes (incluindo `condominium-service`), cada um responsável por um domínio funcional do EquipMap.
- Implementar um BFF (Backend for Frontend) em Node.js + GraphQL como **ponto único de entrada** do frontend — resolve queries/mutations, orquestra chamadas REST aos microserviços e aplica autenticação/autorização.
- Utilizar autenticação baseada em JWT com claim `condominiumId` assinado, refresh token em httpOnly cookie e autorização por roles (`admin`, `manager`, `viewer`).
- Persistir dados por condomínio usando `condominiumId` extraído do JWT como chave de isolamento lógico entre tenants.
- Publicar eventos entre serviços via RabbitMQ (Spring AMQP) para desacoplar atualizações de manutenção, garantias e notificações.
- Exigir `VITE_API_BASE_URL` apontando para o BFF GraphQL para execução do frontend.
- Manter infraestrutura agnóstica de cloud provider via Docker, abstrações de storage (S3-compatible) e configuração por variáveis de ambiente (12-factor).

### Decisões-chave

1. **Java 21 + Spring Boot para microserviços.** Motivo: robustez, ecossistema maduro para aplicações enterprise, Spring Data JPA para persistência, Spring AMQP para mensageria, Spring Security para autenticação/autorização, virtual threads (Java 21) para concorrência eficiente.
2. **BFF Node.js + GraphQL como ponto único de entrada.** Motivo: frontend consome uma única API GraphQL (flexibilidade de queries), BFF orquestra chamadas REST aos microserviços, reduz over-fetching/under-fetching, isola o frontend da topologia de microserviços.
3. **PostgreSQL com um database por serviço.** Motivo: ACID para transações atômicas (sorteio), relacional maduro para vínculos complexos, isolamento de dados por serviço.
4. **RabbitMQ como broker.** Motivo: dead-letter queues para retry, integração nativa com Spring AMQP, complexidade operacional adequada ao volume esperado.
5. **`condominiumId` como claim no JWT assinado.** Motivo: impossível forjar sem chave de assinatura do servidor; elimina header manipulável; troca de contexto via mutation dedicada com emissão de novo token.
6. **Comunicação BFF → microserviços via REST.** Motivo: simplicidade, compatibilidade universal, OpenAPI para documentação de contratos internos.
7. **Soft delete para equipamentos com vínculos.** Motivo: preserva histórico operacional e auditabilidade.
8. **Seed registrado no sorteio de vagas.** Motivo: resultado reprodutível e auditável matematicamente.
9. **Infraestrutura cloud-agnostic.** Motivo: containers Docker puros, abstrações de storage (S3-compatible via MinIO/AWS/GCP/DO Spaces) e configuração por variáveis de ambiente.
10. **Formato de erro RFC 7807 simplificado.** Motivo: padroniza resposta de erro com `statusCode`, `error`, `message`, `details`, `timestamp` e `traceId`.
11. **Gradle (Kotlin DSL) como build tool para todos os projetos Java.** Motivo: builds mais rápidos, DSL type-safe, melhor suporte a composite builds para dev local com `equipmap-core`.
12. **12 repositórios independentes (não monorepo).** Motivo: deploy independente, ownership claro, pipelines isoladas, liberdade de versionamento por serviço.
13. **`equipmap-core` como shared lib publicada via Maven registry (GitHub Packages).** Motivo: DTOs de eventos, interfaces e constantes compartilhadas sem acoplamento; Gradle composite build para iteração rápida em dev local.
14. **Docker Compose por microserviço (autossuficiente).** Motivo: cada repo sobe com `docker compose up` sem depender de repositório externo; inclui suas dependências (Postgres, RabbitMQ, etc.).
15. **Contract tests em dev, integração real em ambiente local e staging.** Motivo: rapidez no ciclo de dev com validação integrada antes de release, sem fallback mock de runtime.
16. **`graphql-codegen` no frontend (schema como source of truth).** Motivo: elimina tipos manuais em `src/types/`; garante sincronia frontend↔BFF; gera hooks tipados para Apollo Client. Configuração obrigatória: quando `typescript-operations` e `typescript-react-apollo` gerarem o arquivo único `src/graphql/generated.tsx`, não combinar com o plugin `typescript` no mesmo destino, para evitar declarações duplicadas de enums/tipos como `AppNotificationType`. Usar unions literais geradas para enums GraphQL e mapear valores por string (`"ACTIVE"`, `"MAINTENANCE_OVERDUE"`, etc.) em `inputs.ts`, `mappers.ts` e hooks.
17. **Admin global = usuário com role `admin` em todos os condomínios (sem flag superuser).** Motivo: modelo uniforme RBAC; admin global é consequência da associação, não de campo especial.
18. **Enums limpos no GraphQL + mapping no BFF.** Motivo: type-safety sobre conveniência; enums sem acentos/espaços; BFF mapeia para labels legíveis quando necessário.
19. **Seed data via migration script (1 admin + 1 condomínio).** Motivo: bootstrap mínimo para primeiro login sem necessidade de setup manual.
20. **Ajustes frontend distribuídos nos milestones (não milestone separado).** Motivo: cada milestone entrega ponta a ponta; frontend evolui junto com o backend correspondente.

### Fora do escopo

- Aplicativo mobile nativo. Motivo: o escopo cobre aplicação web.
- Entrega em tempo real por WebSocket. Motivo: aparece apenas como suporte futuro; modelo preparado para evolução.
- Integração financeira, cobrança condominial, boletos ou inadimplência. Motivo: não há requisitos relacionados.
- Gestão documental completa além de upload de documentos de garantia. Motivo: requisito limitado a NF, contrato ou anexos de garantia.
- Auditoria regulatória avançada, trilha forense e SIEM. Motivo: mantidos apenas campos de auditoria básica (`createdAt`, `updatedAt`, `createdBy`).
- Migração de dados legados. Motivo: não foram fornecidas fontes, formatos ou regras de saneamento.
- Integrações definitivas com fornecedores específicos de WhatsApp/SMS. Motivo: interface de provider abstraída; implementação com provedor real fora do MVP.
- Fila de espera para sorteio de vagas. Motivo: funcionalidade futura; no MVP apenas registro de quem ficou de fora.
- Monorepo. Motivo: optou-se por 12 repos independentes para deploy isolado e ownership claro.

## 3. Funcionalidades

### US01: Autenticar usuários e aplicar permissões por perfil

Como usuário do EquipMap, quero autenticar-me com email/senha ou provedor social, para acessar somente as funcionalidades permitidas ao meu perfil.

**Rules:**
- O BFF deve expor mutations `login`, `logout`, `refresh`, `socialLogin(provider)` e `switchCondominium`, e query `me`.
- O `auth-service` (Spring Boot) deve expor endpoints REST internos: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/social/google`, `POST /auth/social/microsoft` e `POST /auth/switch-condominium`.
- O login com email e senha deve receber `LoginCredentials { email, password }`.
- A resposta de autenticação deve seguir `AuthResponse { user, token, refreshToken? }`.
- O access token deve expirar em 15 minutos e conter claims `userId`, `role` e `condominiumId`.
- O refresh token deve expirar em 7 dias, ser armazenado em httpOnly cookie e rotacionado a cada uso.
- A role `admin` deve permitir acesso total a todos os condomínios.
- A role `manager` deve permitir leitura e escrita no condomínio ativo, exceto operações administrativas globais.
- A role `viewer` deve permitir somente leitura no condomínio ativo.
- O login social deve usar OAuth 2.0 Authorization Code Flow.
- Pós-login, se o usuário pertence a mais de um condomínio, exibir tela de seleção. Se pertence a apenas um, auto-select.
- `switchCondominium` deve validar que o usuário pertence ao condomínio solicitado e emitir novo par de tokens.
- Hash de senha deve usar Bcrypt com cost 12+ (Spring Security `BCryptPasswordEncoder`).
- Refresh token nunca deve ser exposto ao JavaScript (httpOnly + Secure + SameSite=Strict).
- O BFF deve validar o JWT em cada request (verificação de assinatura e claims) antes de rotear para os microserviços.

**Edge cases:**
- Email inexistente ou senha inválida → retornar erro 401 sem revelar qual campo está incorreto.
- Access token expirado → retornar 401 e permitir renovação via mutation `refresh`.
- Refresh token expirado ou revogado → exigir novo login.
- Usuário `viewer` tentando criar, atualizar ou remover registros → retornar 403.
- Usuário autenticado tentando acessar dados de outro `condominiumId` (diferente do claim no JWT) → retornar 403 e registrar tentativa.
- `switchCondominium` para condomínio ao qual o usuário não pertence → retornar 403.
- Falha no provedor Google/Microsoft → retornar erro controlado e não criar usuário parcialmente.
- Tentativa de reuso de refresh token já rotacionado → revogar toda a família de tokens do usuário (detecção de roubo).

**Notas de implementação:**
- Padronizar o header `Authorization: Bearer <token>` no BFF.
- Usar `VITE_AUTH_TOKEN_KEY=equipmap_auth_token` no frontend para armazenamento do access token.
- BFF aplica rate limiting por IP/usuário.
- BFF aplica CORS restrito ao domínio do frontend.
- `auth-service` usa Spring Security com filtro JWT customizado.
- Logs de auditoria em tentativas de acesso cross-tenant.

### US02: Gerenciar condomínios e associação de usuários

Como administrador do EquipMap, quero cadastrar condomínios e associar usuários, para organizar o isolamento de dados e permissões por condomínio.

**Rules:**
- O BFF deve expor queries `condominiums`, `condominium(id)`, `condominiumUsers(condominiumId)` e mutations `createCondominium`, `updateCondominium`, `deleteCondominium`, `addUserToCondominium`, `removeUserFromCondominium`.
- O `condominium-service` (Spring Boot) deve expor endpoints REST internos: `GET /condominiums`, `GET /condominiums/:id`, `POST /condominiums`, `PUT /condominiums/:id`, `DELETE /condominiums/:id`, `GET /condominiums/:id/users`, `POST /condominiums/:id/users` e `DELETE /condominiums/:id/users/:userId`.
- Cada condomínio deve conter, no mínimo: `name`, `cnpj`, `address`, `timezone` (default `America/Sao_Paulo`), `active`.
- A associação `user ↔ condominium` deve conter: `userId`, `condominiumId`, `role` (role do usuário naquele condomínio).
- Um usuário pode ter roles diferentes em condomínios diferentes.
- `GET /condominiums` para `admin` retorna todos; para demais roles retorna apenas os condomínios vinculados.
- O `timezone` do condomínio será utilizado como referência para jobs de atraso/vencimento. Default: `America/Sao_Paulo`.
- Apenas `admin` pode criar, editar e excluir condomínios.
- Apenas `admin` e `manager` podem associar/desassociar usuários.

**Edge cases:**
- CNPJ duplicado → retornar 409.
- Exclusão de condomínio com dados vinculados (equipamentos, manutenções, etc.) → bloquear e retornar erro indicando dependências ativas.
- Remoção do último `admin` de um condomínio → bloquear.
- Associação de usuário já vinculado ao condomínio → retornar 409.
- `timezone` inválido → retornar 400 com valores válidos sugeridos.

**Notas de implementação:**
- Utilizar tabela associativa `condominium_users` com `userId`, `condominiumId` e `role`.
- JPA entity com `@ManyToMany` ou `@OneToMany` para a relação.
- Endpoints de associação devem emitir eventos para invalidação de cache de permissões quando aplicável.

### US03: Gerenciar inventário de equipamentos

Como gestor do condomínio, quero cadastrar, consultar, atualizar e remover equipamentos, para manter um inventário confiável de ativos operacionais.

**Rules:**
- O BFF deve expor queries `equipments(filters)`, `equipment(id)` e mutations `createEquipment`, `updateEquipment`, `deleteEquipment`.
- O `equipment-service` (Spring Boot) deve expor endpoints REST internos: `GET /equipment`, `GET /equipment/:id`, `POST /equipment`, `PUT /equipment/:id` e `DELETE /equipment/:id`.
- `GET /equipment` deve aceitar filtros `search`, `type`, `status`, `page` e `pageSize`.
- Equipamentos devem conter, no mínimo: `name`, `type`, `brand`, `model`, `serialNumber`, `patrimonyCode`, `location`, `status`, `acquisitionDate`, `warrantyExpiry`, `nextMaintenance`, `value` e `condominiumId`.
- `patrimonyCode` deve ser gerado automaticamente e ser único por condomínio.
- Tipos permitidos: `Climatização`, `Transporte`, `Elétrica`, `Hidráulica`, `Segurança`, `Outros`.
- Status permitidos: `Ativo`, `Manutenção`, `Alerta`, `Inativo`.
- Quando `nextMaintenance` for alterada, o serviço deve publicar evento `equipment.maintenance_due` para o `notification-service` via RabbitMQ.
- Quando `warrantyExpiry` estiver vencendo ou vencida, o sistema deve publicar evento `equipment.warranty_expiring` para o `notification-service`.
- Quando `nextMaintenance` estiver vencida, o status deve ser definido automaticamente como `Alerta`.
- `DELETE` executa **soft delete** — marca como `Inativo` e preserva histórico, mas não aparece em listagens padrão (filtrável).

**Edge cases:**
- Dois usuários tentando cadastrar equipamento com mesmo `patrimonyCode` no mesmo condomínio → manter unicidade transacional e retornar 409.
- Data de próxima manutenção anterior à data de aquisição → retornar 400 com mensagem de validação.
- Equipamento inexistente em `GET /equipment/:id`, `PUT` ou `DELETE` → retornar 404.
- Valor monetário negativo → retornar 400.
- Falha ao publicar evento após atualização de `nextMaintenance` → persistir alteração e registrar evento pendente para reprocessamento (Transactional Outbox Pattern).

**Notas de implementação:**
- Paginação padronizada via Spring Data `Pageable`.
- Transactional Outbox Pattern com tabela `outbox_events` + polling ou CDC para garantir consistência entre persistência e publicação de eventos.
- Soft delete implementado com campo `deletedAt` (null = ativo) + `@Where` annotation ou Hibernate filter.

### US04: Gerenciar manutenções preventivas, corretivas e preditivas

Como gestor de manutenção, quero agendar, acompanhar e concluir manutenções, para reduzir atrasos e manter o histórico operacional dos equipamentos.

**Rules:**
- O BFF deve expor queries `maintenances(filters)`, `maintenance(id)` e mutations `createMaintenance`, `updateMaintenance`, `completeMaintenance`, `deleteMaintenance`.
- O `maintenance-service` (Spring Boot) deve expor endpoints REST internos: `GET /maintenance`, `GET /maintenance/:id`, `POST /maintenance`, `PUT /maintenance/:id`, `PATCH /maintenance/:id/complete` e `DELETE /maintenance/:id`.
- `GET /maintenance` deve aceitar filtros `search`, `status`, `type`, `page` e `pageSize`.
- Tipos permitidos: `Preventiva`, `Corretiva`, `Preditiva`.
- Status permitidos: `Pendente`, `Em andamento`, `Concluída`, `Atrasada`, `Cancelada`.
- A criação de manutenção deve aceitar `CreateMaintenanceDto { equipment, equipmentId?, type, scheduledDate, technician?, provider?, description }`.
- A conclusão deve aceitar `CompleteMaintenanceDto { completedDate, cost?, observations? }`.
- **Validação de `completedDate`:**
  - Para manutenções **Preventiva** e **Preditiva**: `completedDate >= scheduledDate` (bloquear se anterior).
  - Para manutenções **Corretiva**: `completedDate` pode ser anterior a `scheduledDate` (corretiva é reativa).
- Um job agendado (`@Scheduled`) deve marcar como `Atrasada` toda manutenção com `scheduledDate < hoje` e status `Pendente`. O "hoje" é calculado com base no timezone do condomínio (default `America/Sao_Paulo`, parametrizável).
- Ao concluir uma manutenção, o serviço deve publicar evento `maintenance.completed` via RabbitMQ.
- O `equipment-service` deve consumir `maintenance.completed` e atualizar `lastMaintenance` do equipamento relacionado.
- Manutenções atrasadas devem gerar evento `maintenance.overdue` para o `notification-service`.

**Edge cases:**
- Manutenção criada para `equipmentId` inexistente → retornar 404 com mensagem indicando equipamento não encontrado.
- Equipamento informado apenas como texto, sem `equipmentId` → permitir registro com snapshot textual, mas sem atualização automática do equipamento.
- Dois usuários concluindo a mesma manutenção simultaneamente → apenas a primeira conclusão deve ser aceita; a segunda deve retornar 409 (optimistic locking com `@Version`).
- Falha ao atualizar `lastMaintenance` no `equipment-service` → manter evento para retry via dead-letter queue e não desfazer a conclusão.
- Job diário executado mais de uma vez → processamento deve ser idempotente e não gerar notificações duplicadas.

**Notas de implementação:**
- Eventos de atraso devem conter `maintenanceId`, `equipmentId`, `condominiumId`, `scheduledDate` e severidade sugerida.
- Timezone do condomínio obtido do `condominium-service` via REST ou cache local.
- Job agendado via Spring `@Scheduled` (cron expression).
- Optimistic locking via JPA `@Version` para controle de concorrência.

### US05: Gerenciar garantias e documentos relacionados

Como gestor do condomínio, quero cadastrar garantias e acompanhar vencimentos, para evitar perda de cobertura e acionar fornecedores no prazo.

**Rules:**
- O BFF deve expor queries `warranties(filters)`, `warranty(id)`, `warrantyUploadUrl(warrantyId, fileName)` e mutations `createWarranty`, `updateWarranty`, `deleteWarranty`, `confirmWarrantyUpload`.
- O `warranty-service` (Spring Boot) deve expor endpoints REST internos: `GET /warranties`, `GET /warranties/:id`, `POST /warranties`, `PUT /warranties/:id`, `DELETE /warranties/:id`, `POST /warranties/:id/upload-url` e `POST /warranties/:id/confirm-upload`.
- `GET /warranties` deve aceitar filtros `search`, `status`, `type`, `page` e `pageSize`.
- Tipos permitidos: `Fabricante`, `Fornecedor`, `Estendida`, `Serviço`.
- Status de garantia deve ser calculado dinamicamente:
  - `Vencida` quando `warrantyEnd < hoje`.
  - `Vencendo` quando `warrantyEnd` estiver entre hoje e os proximos 30 dias.
  - `Vigente` quando `warrantyEnd` estiver alem da janela de 30 dias.
- O BFF deve expor no `dashboardSummary.warrantyExpiringTotal` a quantidade de garantias vencendo em ate 30 dias para que o frontend exiba o badge ao lado de `Garantias`, seguindo o mesmo padrao do badge de `Manutencoes`.
- O cadastro de garantias deve enviar `purchaseDate`, `warrantyStart`, `warrantyEnd` em formato ISO `yyyy-MM-dd` e `warrantyMonths >= 1`; quando o usuario informar inicio e fim, o frontend deve calcular a duracao em meses antes de chamar o BFF.
  - `Vencendo` quando vence em até 90 dias.
  - `Vigente` nos demais casos.
- O sistema deve permitir `documentUrl` para armazenar referência de NF, contrato ou documento de garantia.
- Upload de documento via pre-signed URL do storage S3-compatible (MinIO em dev, qualquer S3-compatible em produção).
- Tipos de arquivo permitidos: **PDF, JPG, JPEG, PNG**.
- Tamanho máximo por arquivo: **10 MB**.
- Um job diário (`@Scheduled`) deve verificar garantias prestes a vencer e publicar eventos `warranty.expiring` e `warranty.expired` para o `notification-service` via RabbitMQ.

**Edge cases:**
- `warrantyEnd` anterior a `warrantyStart` → retornar 400.
- Garantia criada sem `equipmentId`, mas com dados de equipamento em snapshot → permitir, mas sem vínculo navegável com equipamento.
- Documento acima de 10 MB → retornar 413.
- Tipo de arquivo não permitido → retornar 400 com tipos aceitos.
- Falha no storage durante upload → não criar garantia com `documentUrl` inválida; retornar 502 indicando falha de storage.
- Job diário reprocessando garantia já notificada → não duplicar alerta ativo; deduplicar por chave `type + resourceId + condominiumId`.
- Alteração de `warrantyEnd` de vencida para vigente → encerrar notificações relacionadas àquela garantia.

**Notas de implementação:**
- Upload via pre-signed URL: frontend solicita URL ao BFF → BFF chama `warranty-service` → gera pre-signed URL via AWS SDK (S3-compatible) → frontend faz upload direto ao storage → confirma com BFF/backend.

### QR Code de equipamentos para impressao

- A tela de inventario deve permitir gerar um QR Code imprimivel para cada equipamento usando somente os dados reais do equipamento retornados pelo BFF.
- O QR Code deve ser legivel por celulares e tablets, gerado por biblioteca validada (`qrcode` no frontend) com margem suficiente, tamanho minimo de exibicao/impressao e payload compacto.
- O payload deve conter os dados atuais do equipamento necessarios para identificacao operacional: `id`, `name`, `patrimonyCode`, `type`, `brand`, `model`, `serialNumber`, `location`, `status`, `acquisitionDate`, `warrantyExpiry`, `lastMaintenance`, `nextMaintenance` e `value`.
- O QR Code nao deve criar estado mockado, nao deve persistir dados locais e nao substitui um contrato futuro de validacao/armazenamento no backend.
- Interface `StorageService` com implementação S3-compatible (funciona com MinIO, AWS S3, GCP Cloud Storage, DigitalOcean Spaces).
- Validação de tipo MIME no backend (não confiar apenas na extensão).
- Spring `@Scheduled` para job diário.

### US06: Executar sorteio de vagas de garagem

Como administrador do condomínio, quero cadastrar apartamentos e vagas e executar sorteio de garagem, para distribuir vagas de forma aleatória, auditável e persistente.

**Rules:**
- O BFF deve expor queries `parkingApartments`, `parkingSpots`, `parkingResults` e mutations `createApartment`, `updateApartment`, `deleteApartment`, `createSpot`, `updateSpot`, `deleteSpot`, `executeLottery`, `resetLottery`.
- O `parking-service` (Spring Boot) deve expor endpoints REST internos para apartamentos:
  - `GET /parking/apartments`
  - `POST /parking/apartments`
  - `PUT /parking/apartments/:id`
  - `DELETE /parking/apartments/:id`
- O `parking-service` deve expor endpoints REST internos para vagas:
  - `GET /parking/spots`
  - `POST /parking/spots`
  - `PUT /parking/spots/:id`
  - `DELETE /parking/spots/:id`
- O `parking-service` deve expor endpoints REST internos para sorteio:
  - `GET /parking/results`
  - `POST /parking/lottery`
  - `DELETE /parking/lottery`
- Apenas apartamentos com `hasVehicle: true` devem participar do sorteio.
- Apartamentos já sorteados não podem participar de novas rodadas até reset.
- O sorteio deve ser atômico: ou todos os pares elegíveis são persistidos ou nenhum (Spring `@Transactional` com isolation `SERIALIZABLE`).
- O sorteio deve utilizar **seed registrado** (salvo junto ao resultado) para que o processo seja matematicamente reprodutível e auditável.
- `LotteryResult` deve gravar snapshots de unidade, bloco, proprietário, número da vaga, tipo da vaga, seed utilizado e `drawnAt`.
- Quando o número de **apartamentos elegíveis excede o número de vagas disponíveis**: sortear até o limite de vagas e registrar claramente quais apartamentos ficaram de fora (campo `undrawnApartments` no resultado).
- Quando o número de vagas é maior que apartamentos elegíveis: manter vagas remanescentes sem atribuição.
- O reset do sorteio deve remover resultados existentes e liberar apartamentos/vagas para nova rodada. Apenas `admin` pode executar reset.

**Edge cases:**
- Dois administradores executando sorteio ao mesmo tempo → aplicar lock transacional e permitir somente uma execução; segunda retorna 409.
- Reset executado → exigir permissão de `admin`.
- Apartamento sem veículo tentando participar → ignorar no sorteio.
- Falha no meio da persistência dos resultados → rollback total da transação.
- Nenhum apartamento elegível → retornar 400 com mensagem explicativa.
- Nenhuma vaga cadastrada → retornar 400 com mensagem explicativa.

**Notas de implementação:**
- Usar algoritmo Fisher-Yates com seed determinístico (ex: `java.util.Random(seed)` ou library equivalente).
- Registrar seed como campo do `LotteryResult` para reprodutibilidade.
- Transação PostgreSQL com `SERIALIZABLE` isolation level via `@Transactional(isolation = Isolation.SERIALIZABLE)`.

### US07: Gerenciar brigadistas e notificações em massa

Como gestor de segurança do condomínio, quero cadastrar brigadistas, acompanhar certificações e enviar comunicações em massa, para manter a brigada atualizada e acionável em emergências.

**Rules:**
- O BFF deve expor queries `brigadiers(filters)`, `brigadier(id)`, `brigadierNotifyLogs` e mutations `createBrigadier`, `updateBrigadier`, `deleteBrigadier`, `notifyBrigadiers`.
- O `brigadier-service` (Spring Boot) deve expor endpoints REST internos: `GET /brigadiers`, `GET /brigadiers/:id`, `POST /brigadiers`, `PUT /brigadiers/:id`, `DELETE /brigadiers/:id`, `POST /brigadiers/notify` e `GET /brigadiers/notify/logs`.
- A busca de brigadistas deve permitir filtro por nome, função e status.
- Papéis permitidos: `Brigadista`, `Brigadista Chefe`, `Sub-Chefe`.
- Cada brigadista deve conter `certificationDate`, `certificationExpiry`, `certificationBody`, `phone`, `active`.
- Certificações devem ser monitoradas:
  - `Vencendo` quando expira em até 90 dias.
  - `Vencida` quando a data está no passado.
- Envio via WhatsApp deve ser integrado com interface de provider (abstração para WhatsApp Business API ou equivalente).
- Envio via SMS deve ser integrado com interface de provider (abstração para gateway SMS).
- Todo envio deve gerar **um registro individual de `NotificationLog` por destinatário**, com status `sent` ou `failed`.
- Notificações em lote devem ser enviadas de forma assíncrona por fila RabbitMQ (Spring AMQP).
- Brigadistas inativos devem ser **silenciosamente ignorados** no envio em massa (não bloquear o lote).

**Edge cases:**
- Provedor de WhatsApp indisponível → registrar `failed` no `NotificationLog` por destinatário e permitir retry manual.
- Número de telefone inválido → não enviar para o destinatário e registrar falha de validação no log.
- Mensagem vazia ou acima do limite do provedor → retornar 400 antes de enfileirar.
- Nenhum brigadista ativo selecionado → retornar 400.
- Dois envios em massa simultâneos com mesma mensagem → permitir, registrar logs separados.

**Notas de implementação:**
- Interface `MessagingProvider` com implementações `WhatsAppProvider` e `SmsProvider` (Strategy Pattern via Spring DI).
- No MVP, implementar com `SandboxMessagingProvider` explícito via configuração local. Provedor real definido pós-MVP.
- Retry configurável via dead-letter queue do RabbitMQ.
- `@RabbitListener` para processamento assíncrono dos envios.

### US08: Centralizar alertas internos do sistema

Como usuário autenticado, quero visualizar e gerenciar notificações do EquipMap, para priorizar manutenções, garantias e alertas relevantes do meu condomínio.

**Rules:**
- O BFF deve expor queries `notifications(filters)` e mutations `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification`.
- O `notification-service` (Spring Boot) deve expor endpoints REST internos: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` e `DELETE /notifications/:id`.
- As notificações devem ser criadas a partir de eventos publicados pelos serviços de equipamento, manutenção e garantia via RabbitMQ (`@RabbitListener`).
- Tipos suportados no MVP:
  - `maintenance_overdue`
  - `maintenance_pending`
  - `warranty_expiring`
  - `warranty_expired`
- Severidade deve seguir o mapeamento:
  - `maintenance_overdue` → `high`
  - `warranty_expired` → `high`
  - `maintenance_pending` → `medium`
  - `warranty_expiring` → `medium`
- Notificações devem ser filtradas pelo usuário autenticado e respectivo `condominiumId` (do JWT).
- `read` deve iniciar como `false`.
- `DELETE /notifications/:id` executa exclusão lógica apenas para o usuário autenticado (notificações são pessoais).
- Deduplicação por chave: `type + resourceId + userId + condominiumId`. Evento duplicado não cria nova notificação ativa.

**Edge cases:**
- Evento duplicado recebido pelo `notification-service` → não criar notificação duplicada ativa para o mesmo recurso e tipo.
- Usuário tenta marcar notificação de outro usuário como lida → retornar 403.
- Notificação já lida recebe novo patch de leitura → operação idempotente, retornar 200.
- Falha temporária no RabbitMQ → consumidores devem retomar processamento sem perda de evento (acknowledgment manual + persistent messages).
- Job diário e evento online criam o mesmo alerta → deduplicar por chave de negócio.

**Notas de implementação:**
- WebSocket fica fora do MVP, mas o modelo (JPA entity `Notification`) deve permitir evolução futura.
- Chave de deduplicação implementada como unique constraint condicional (onde `deletedAt IS NULL`).
- `@RabbitListener` com `AcknowledgeMode.MANUAL` para garantir processamento confiável.

### US09: Conectar frontend ao backend real preservando contratos

Como desenvolvedor do EquipMap, quero conectar o frontend existente ao BFF GraphQL sem alterar a experiência das telas, para substituir mocks por dados persistentes com baixo retrabalho.

**Rules:**
- Quando `VITE_API_BASE_URL` estiver vazio, o frontend deve falhar com erro claro de configuração.
- Quando `VITE_API_BASE_URL` estiver preenchido, o frontend deve consumir o BFF GraphQL.
- O BFF deve expor um schema GraphQL compatível com os contratos TypeScript já esperados em `src/types/`.
- O BFF deve retornar erros GraphQL com extensões padronizadas:
  ```json
  {
    "errors": [{
      "message": "Patrimony code already exists for this condominium",
      "extensions": {
        "code": "CONFLICT",
        "statusCode": 409,
        "details": [{ "field": "patrimonyCode", "issue": "duplicate" }],
        "timestamp": "2026-05-18T14:30:00Z",
        "traceId": "abc-123"
      }
    }]
  }
  ```
- Os microserviços REST internos devem retornar erros no formato RFC 7807 simplificado:
  ```json
  {
    "statusCode": 409,
    "error": "CONFLICT",
    "message": "Patrimony code already exists for this condominium",
    "details": [{ "field": "patrimonyCode", "issue": "duplicate" }],
    "timestamp": "2026-05-18T14:30:00Z",
    "traceId": "abc-123"
  }
  ```
- Queries de listagem devem suportar paginação compatível com `page` e `pageSize` (argumentos GraphQL mapeados para query params REST no BFF).
- O frontend deve enviar o token conforme `VITE_AUTH_TOKEN_TYPE=Bearer` no header da request GraphQL.
- O timeout padrão de chamada deve respeitar `VITE_API_TIMEOUT=10000`.

**Edge cases:**
- BFF indisponível → frontend deve exibir mensagem de erro amigável e manter tela estável.
- Token expirado durante chamada → frontend deve tentar refresh uma vez; se falhar, redirecionar para login.
- Schema GraphQL divergente dos tipos frontend → falhar testes de contrato antes do deploy.
- Campo opcional ausente na resposta → frontend deve renderizar fallback quando aplicável.
- Paginação retorna página vazia fora do intervalo → exibir lista vazia sem quebrar navegação.
- Timeout de API → exibir feedback ao usuário e registrar erro técnico.
- Microserviço indisponível → BFF deve retornar erro parcial GraphQL (campos resolvíveis são retornados, campos do serviço indisponível retornam null com erro no array `errors`).

**Notas de implementação:**
- Criar suíte de testes de contrato entre frontend ↔ BFF (schema GraphQL) e BFF ↔ microserviços (OpenAPI/REST).
- Manter compatibilidade com o padrão Repository + Service Layer já definido no frontend.
- Frontend consome GraphQL via Apollo Client.
- `graphql-codegen` deve gerar `src/graphql/generated.tsx` a partir de `bff-equipmap/schema.graphql` e `src/graphql/operations.graphql`, usando `typescript-operations` e `typescript-react-apollo` no destino único. Não adicionar o plugin `typescript` ao mesmo destino quando os plugins de operações já estiverem emitindo os tipos base, pois isso duplica declarações como `AppNotificationType` e quebra o Vite/Babel com `Identifier '<Tipo>' has already been declared`.
- Enums GraphQL no frontend devem ser tratados como unions literais geradas pelo codegen; código de mapeamento deve usar chaves string dos valores do schema (`"ADMIN"`, `"ACTIVE"`, `"MAINTENANCE_OVERDUE"`, etc.), não acessos runtime como `Role.Admin` ou `AppNotificationType.MaintenanceOverdue`.
- Validação obrigatória após alterações no schema, operações GraphQL ou configuração de codegen: executar `npm run codegen` e `npm run build` no `fe-equipmap`.
- BFF usa Apollo Server ou similar (Node.js).

## 4. Visão de Arquitetura

A feature envolve frontend, BFF GraphQL, microserviços Java/Spring Boot, message broker, jobs agendados, storage e integrações externas de comunicação.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Usuário Web (Browser)                            │
│                    React 18 + TypeScript + Vite                         │
│              Repository + Service Layer + Auth Context                  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS GraphQL
                                    │ Authorization: Bearer <JWT>
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BFF (Node.js + GraphQL)                               │
│    Apollo Server │ JWT Validation │ Rate Limiting │ CORS │ Orchestration │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────────────┘
   │      │      │      │      │      │      │      │
   │      │      │      │  REST (HTTP)  │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐
│Auth ││Cond.││Equip││Maint││Warr.││Park.││Brig.││Notif│
│Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc  │
│Java ││Java ││Java ││Java ││Java ││Java ││Java ││Java │
│Boot ││Boot ││Boot ││Boot ││Boot ││Boot ││Boot ││Boot │
└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘
   │      │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PostgreSQL (database por serviço) + Spring Data JPA         │
└─────────────────────────────────────────────────────────────────────────┘

Comunicação assíncrona (Spring AMQP):
┌──────────┐     ┌───────────────────────────┐     ┌──────────┐
│Equip Svc │────▶│        RabbitMQ            │────▶│Notif Svc │
│Maint Svc │────▶│   (eventos + DLQ)         │────▶│Equip Svc │
│Warr. Svc │────▶│                           │────▶│          │
│Brig. Svc │────▶│                           │────▶│Msg Worker│
└──────────┘     └───────────────────────────┘     └──────────┘

Storage:
┌──────────┐     ┌───────────────────────────┐
│Warr. Svc │────▶│ MinIO (S3-compatible)     │
│(pre-sign)│     │ PDF, JPG, JPEG, PNG ≤10MB │
└──────────┘     └───────────────────────────┘

Integrações externas:
┌──────────┐     ┌───────────────────────────┐
│Auth Svc  │────▶│ Google/Microsoft OAuth    │
│Brig. Svc │────▶│ WhatsApp/SMS Provider     │
│          │     │ (sandbox explícito MVP)    │
└──────────┘     └───────────────────────────┘
```

### Eventos esperados no MVP

| Produtor | Evento | Consumidor | Objetivo |
|---|---|---|---|
| `equipment-service` | `equipment.warranty_expiring` | `notification-service` | Gerar alerta de garantia próxima do vencimento |
| `equipment-service` | `equipment.maintenance_due` | `notification-service` | Gerar alerta de manutenção próxima ou vencida |
| `maintenance-service` | `maintenance.overdue` | `notification-service` | Gerar alerta crítico de manutenção atrasada |
| `maintenance-service` | `maintenance.completed` | `equipment-service` | Atualizar `lastMaintenance` do equipamento |
| `warranty-service` | `warranty.expiring` | `notification-service` | Gerar alerta de garantia vencendo |
| `warranty-service` | `warranty.expired` | `notification-service` | Gerar alerta crítico de garantia vencida |
| `brigadier-service` | `brigadier.notification_requested` | Worker de mensagens | Processar envio assíncrono de mensagens em massa |

## 5. Critérios de Aceite

### Técnicos

| Critério | Método de verificação |
|----------|----------------------|
| Todos os endpoints descritos nas US01-US09 devem estar implementados e documentados em OpenAPI. | Revisão da especificação OpenAPI e execução de testes automatizados por endpoint. |
| APIs protegidas devem exigir `Authorization: Bearer <token>` com `condominiumId` no claim JWT. | Testes automatizados com token ausente, inválido, expirado, e com `condominiumId` divergente. |
| RBAC deve bloquear escrita para `viewer` e permitir escrita para `admin` e `manager` conforme regras definidas. | Testes de autorização por role em endpoints `POST`, `PUT`, `PATCH` e `DELETE`. |
| Dados devem ser isolados por `condominiumId` extraído do JWT. | Testes com usuários de condomínios diferentes tentando acessar o mesmo recurso. |
| Listagens devem suportar paginação por `page` e `pageSize`. | Testes com múltiplas páginas, página vazia e parâmetros inválidos. |
| Jobs diários de manutenção e garantia devem ser idempotentes. | Executar o job duas vezes no mesmo dataset e validar que não há duplicidade de alertas. |
| Publicação e consumo de eventos devem ser resilientes a falhas temporárias (persistent messages + manual ack + DLQ). | Testes simulando broker indisponível e posterior reprocessamento. |
| Sorteio de vagas deve ser transacional e reprodutível via seed. | Teste de falha forçada no meio do sorteio validando rollback total + re-execução com mesmo seed gerando mesmo resultado. |
| `patrimonyCode` deve ser único por condomínio. | Teste concorrente tentando criar equipamentos duplicados. |
| Conclusão de manutenção deve atualizar `lastMaintenance` do equipamento via evento. | Teste de integração entre `maintenance-service`, RabbitMQ e `equipment-service`. |
| Garantias vencendo em até 30 dias devem gerar alerta de severidade `medium`; garantias vencidas devem gerar `high`. | Teste com datas controladas e validação de notificações geradas. |
| Refresh token deve estar em httpOnly cookie e rotacionar a cada uso. | Teste validando que token não é acessível via JS e que reuso de token antigo revoga família. |
| Soft delete de equipamentos preserva histórico e não aparece em listagem padrão. | Teste de exclusão + verificação de que dados permanecem acessíveis via filtro específico. |
| Erros devem seguir formato padronizado (RFC 7807 simplificado). | Validação de schema em todas as respostas de erro. |
| Tempo de resposta p95 ≤ 500ms para endpoints de consulta simples em homologação. | Teste de carga com dataset representativo. |
| Frontend falha com erro claro quando `VITE_API_BASE_URL` vazio. | Teste de configuração sem variável obrigatória. |
| Frontend consome backend real quando `VITE_API_BASE_URL` configurado. | Teste end-to-end com ambiente de homologação. |

### De negócio

| Métrica | Baseline (fonte) | Meta | Prazo | Mín. aceitável | Responsável |
|---------|-------------------|------|-------|-----------------|-------------|
| Percentual de equipamentos críticos cadastrados no EquipMap | A levantar com síndico/administradora a partir de inventário atual ou planilhas existentes | 90% dos equipamentos críticos cadastrados | 60 dias após go-live do MVP | 75% | Product Owner + gestor do condomínio |
| Redução de manutenções preventivas atrasadas | A levantar a partir de histórico manual atual ou primeira medição do EquipMap | Reduzir em 30% o volume de manutenções preventivas atrasadas | 90 dias após go-live | Redução de 15% | Product Owner + gestor de manutenção |
| Garantias com alerta antes do vencimento | A levantar a partir de garantias cadastradas no MVP | 95% das garantias com vencimento em até 30 dias devem gerar alerta | 30 dias após cadastro das garantias | 85% | Product Owner + gestor operacional |
| Sorteios de vaga executados sem inconsistência manual | A levantar com histórico de sorteios anteriores | 100% dos sorteios do período registrados com resultado persistido e reprodutível | Próximo ciclo de sorteio após go-live | 95% | Administrador do condomínio |
| Tempo médio para localizar informações de equipamento | A levantar por observação ou entrevista com usuários-chave | Reduzir em 50% o tempo médio de localização | 60 dias após go-live | Redução de 30% | Product Owner |
| Brigadistas ativos com certificação válida cadastrada | A levantar com lista atual da brigada | 100% dos brigadistas ativos com data de certificação e validade cadastradas | 45 dias após go-live | 90% | Gestor de segurança |

**Regras:**
- Baselines devem ser levantadas antes da homologação de negócio.
- Quando não houver histórico confiável, a primeira medição do MVP deverá ser usada como baseline inicial.
- O mínimo aceitável define o corte de sucesso operacional; abaixo dele, a entrega deve ser considerada parcialmente malsucedida e exigir plano de correção.

## 6. Milestones

### Milestone 1: Preparar Fundação Técnica

**Objetivo:** Disponibilizar a base técnica mínima para autenticação, gerenciamento de condomínios, BFF GraphQL e execução integrada do frontend com backend real.

**Funcionalidades:** US01, US02, US09

- [ ] Criar repositórios: `bff-equipmap`, `auth-service`, `condominium-service`, `equipmap-core`, `equipmap-infra`.
- [ ] Configurar Gradle (Kotlin DSL) para `auth-service`, `condominium-service` e `equipmap-core`.
- [ ] Implementar `equipmap-core` com DTOs de eventos, interfaces base e publicação via GitHub Packages.
- [ ] Implementar BFF com Apollo Server, validação JWT, rate limiting, CORS e schema GraphQL base.
- [ ] Implementar `auth-service` (Spring Boot) com login, refresh (httpOnly cookie + rotação), logout, `GET /auth/me` e `POST /auth/switch-condominium`.
- [ ] Implementar RBAC com Spring Security para `admin`, `manager` e `viewer`.
- [ ] Implementar `condominium-service` (Spring Boot) com CRUD e associação de usuários.
- [ ] Criar seed data via Flyway migration: 1 admin + 1 condomínio.
- [ ] Criar Docker Compose por serviço (autossuficiente) + `equipmap-infra` para orquestração.
- [ ] Criar documentação OpenAPI para endpoints REST internos.
- [ ] Criar schema GraphQL com tipos base, enums limpos e mutations de auth.
- [ ] **Frontend:** Configurar Apollo Client + `graphql-codegen` no `fe-equipmap`.
- [ ] **Frontend:** Migrar `AuthContext` para consumir mutations GraphQL do BFF.
- [ ] **Frontend:** Implementar tela de seleção de condomínio (pós-login, multi-tenancy).
- [ ] **Frontend:** Remover types manuais de auth/condominium em `src/types/` (substituídos por codegen).

**Critério de conclusão:**
- Condição: usuário consegue autenticar via GraphQL, selecionar condomínio, obter token com claim `condominiumId` e acessar query protegida via frontend configurado para BFF.
- Verificação: testes automatizados de autenticação + teste end-to-end simples.
- Aprovador: Product Owner + responsável técnico.

### Milestone 2: Entregar Inventário e Manutenção

**Objetivo:** Permitir o cadastro de equipamentos e o controle básico de manutenções com histórico operacional.

**Funcionalidades:** US03, US04

- [ ] Implementar `equipment-service` (Spring Boot) com CRUD, filtros, paginação (Spring Data) e soft delete.
- [ ] Implementar geração automática e unicidade de `patrimonyCode`.
- [ ] Implementar Transactional Outbox Pattern para eventos do `equipment-service`.
- [ ] Implementar `maintenance-service` (Spring Boot) com CRUD e validação de `completedDate` por tipo.
- [ ] Implementar conclusão de manutenção via `PATCH /maintenance/:id/complete` com optimistic locking (`@Version`).
- [ ] Publicar e consumir evento `maintenance.completed` (Spring AMQP) para atualizar `lastMaintenance`.
- [ ] Implementar job de marcação de manutenções atrasadas (`@Scheduled`, idempotente, timezone-aware).
- [ ] **Frontend:** Migrar hooks `useEquipment` e `useMaintenance` para Apollo Client (queries/mutations GraphQL).
- [ ] **Frontend:** Remover types manuais de equipment/maintenance em `src/types/` (substituídos por codegen).
- [ ] Expor queries e mutations de equipamento e manutenção no BFF.

**Critério de conclusão:**
- Condição: usuário `manager` consegue cadastrar equipamento, agendar manutenção, concluir manutenção e visualizar histórico atualizado via frontend/GraphQL.
- Verificação: testes de integração entre `equipment-service` e `maintenance-service` + demo funcional.
- Aprovador: Product Owner + gestor de manutenção.

### Milestone 3: Entregar Garantias e Alertas Operacionais

**Objetivo:** Monitorar vencimento de garantias e centralizar alertas de manutenção e garantia.

**Funcionalidades:** US05, US08

- [ ] Implementar `warranty-service` (Spring Boot) com CRUD e cálculo dinâmico de status.
- [ ] Implementar upload de documentos via pre-signed URL (MinIO/S3-compatible, AWS SDK).
- [ ] Implementar validação de tipo MIME e tamanho (PDF, JPG, JPEG, PNG ≤ 10 MB).
- [ ] Implementar `notification-service` (Spring Boot) com listagem, leitura, leitura em massa e exclusão lógica pessoal.
- [ ] Implementar consumo de eventos via `@RabbitListener`: `warranty.expiring`, `warranty.expired`, `maintenance.overdue`, `maintenance_pending`.
- [ ] Implementar deduplicação por chave `type + resourceId + userId + condominiumId`.
- [ ] Implementar job diário de garantias vencendo/vencidas (`@Scheduled`, idempotente, timezone-aware).
- [ ] Expor queries e mutations de garantias e notificações no BFF.
- [ ] **Frontend:** Migrar hooks `useWarranty` para Apollo Client.
- [ ] **Frontend:** Integrar `NotificationContext` com queries GraphQL do `notification-service`.

**Critério de conclusão:**
- Condição: garantias vencendo e manutenções atrasadas geram notificações com severidade correta para o usuário do condomínio, sem duplicatas.
- Verificação: testes com datas simuladas + inspeção das notificações no frontend.
- Aprovador: Product Owner + gestor operacional.

### Milestone 4: Entregar Sorteio de Garagem

**Objetivo:** Automatizar o sorteio de vagas com persistência, atomicidade, seed auditável e registro de excedentes.

**Funcionalidades:** US06

- [ ] Implementar `parking-service` (Spring Boot) com CRUD de apartamentos e vagas.
- [ ] Implementar execução transacional do sorteio com seed registrado (Fisher-Yates + `java.util.Random(seed)`).
- [ ] Implementar `@Transactional(isolation = SERIALIZABLE)` para atomicidade.
- [ ] Implementar persistência de `LotteryResult` com snapshots e campo `undrawnApartments`.
- [ ] Implementar reset de sorteio com controle de permissão (`admin` only).
- [ ] Implementar tratamento de excedente (apt > vagas → sorteio parcial).
- [ ] Expor queries e mutations de parking no BFF.
- [ ] **Frontend:** Migrar hook `useParking` para Apollo Client; adaptar para novo tipo `LotterySession`.

**Critério de conclusão:**
- Condição: administrador consegue cadastrar apartamentos/vagas, executar sorteio reprodutível, visualizar resultados e verificar excedentes.
- Verificação: teste transacional + teste de reprodutibilidade com mesmo seed + demo funcional.
- Aprovador: Product Owner + administrador do condomínio.

### Milestone 5: Entregar Brigadistas e Comunicação em Massa

**Objetivo:** Cadastrar brigadistas, monitorar certificações e permitir envio assíncrono de comunicações com log individual por destinatário.

**Funcionalidades:** US07

- [ ] Implementar `brigadier-service` (Spring Boot) com CRUD e filtro por nome, função e status.
- [ ] Implementar monitoramento de vencimento de certificações.
- [ ] Implementar `POST /brigadiers/notify` com enfileiramento assíncrono via RabbitMQ (Spring AMQP).
- [ ] Implementar worker de envio com `@RabbitListener` e `NotificationLog` individual por destinatário.
- [ ] Implementar interface `MessagingProvider` com provider sandbox explícito (Strategy Pattern via Spring DI).
- [ ] Implementar retry via dead-letter queue.
- [ ] Filtro silencioso de brigadistas inativos no envio.
- [ ] Expor queries e mutations de brigadistas no BFF.
- [ ] **Frontend:** Migrar hook `useBrigadiers` para Apollo Client.

**Critério de conclusão:**
- Condição: gestor consegue selecionar brigadistas, enviar mensagem e consultar log com status por destinatário.
- Verificação: teste com provider sandbox + validação dos logs.
- Aprovador: Product Owner + gestor de segurança.

### Milestone 6: Homologar MVP Integrado

**Objetivo:** Validar o fluxo completo do EquipMap com frontend real, backend, autenticação, multi-tenancy, persistência, eventos e notificações.

**Funcionalidades:** US01, US02, US03, US04, US05, US06, US07, US08, US09

- [ ] Executar testes end-to-end dos principais fluxos.
- [ ] Validar RBAC por perfil (admin, manager, viewer).
- [ ] Validar isolamento por `condominiumId` (claim JWT) entre condomínios.
- [ ] Validar switch de condomínio e multi-tenancy.
- [ ] Validar jobs diários com massa de teste (idempotência, timezone).
- [ ] Validar resiliência do RabbitMQ e reprocessamento via DLQ.
- [ ] Coletar baselines de negócio pendentes.
- [ ] Registrar pendências para versão pós-MVP.

**Critério de conclusão:**
- Condição: fluxos críticos aprovados em homologação e sem defeitos bloqueantes.
- Verificação: checklist de homologação + evidência de testes automatizados + demo final.
- Aprovador: Product Owner + responsável técnico + representante do condomínio piloto.

## 7. Riscos e Dependências

| Risco | Impacto | Mitigação | Status |
|-------|---------|-----------|--------|
| Escopo amplo para um único MVP com 8 microserviços + BFF. | Alto | Entregar por milestones independentes; priorizar auth, condominium, equipamentos, manutenção e notificações antes de módulos complementares. | Monitorando |
| Divergência entre schema GraphQL (BFF) e contratos TypeScript (frontend). | Alto | Criar testes de contrato automáticos entre frontend ↔ BFF e BFF ↔ microserviços (OpenAPI). | Pendente |
| Complexidade de manter dois ecossistemas (Node.js + Java). | Médio | Separação clara de responsabilidades: BFF apenas orquestra, microserviços contêm regras de negócio. Docker Compose padronizado para dev. | Monitorando |
| Eventos duplicados gerando notificações repetidas. | Médio | Idempotência e chave de deduplicação no `notification-service`. | Pendente |
| Falha parcial entre persistência e publicação de evento. | Alto | Transactional Outbox Pattern para eventos críticos. | Pendente |
| Escolha tardia de provedor WhatsApp/SMS. | Médio | Interface `MessagingProvider` com provider sandbox explícito até decisão definitiva. | Monitorando |
| Dados legados inexistentes ou incompletos. | Médio | Carga inicial manual; migração fora do escopo MVP. | Aceito |
| Métricas de negócio sem baseline confiável. | Médio | Levantar baseline com usuários-chave antes da homologação. | Pendente |
| Exposição indevida de dados entre condomínios. | Alto | `condominiumId` no claim JWT (não manipulável); testes obrigatórios de isolamento; logs de tentativa cross-tenant. | Pendente |
| Complexidade operacional de múltiplos databases PostgreSQL. | Médio | Docker Compose padronizado para dev; Flyway ou Liquibase para migrations versionadas. | Monitorando |
| Latência adicional introduzida pelo BFF como intermediário. | Baixo | BFF faz chamadas paralelas via DataLoader quando possível; monitorar p95 em homologação. | Monitorando |
| Coordenação entre 12 repos independentes. | Médio | Versionamento semântico de `equipmap-core`; contract tests em pipelines; documentação centralizada em `equipmap-infra`. | Monitorando |
| `equipmap-core` como ponto de acoplamento entre serviços. | Médio | Manter lib minimal (DTOs de eventos + interfaces); evitar regras de negócio; versionamento com compatibilidade retroativa. | Monitorando |

**Dependências:**

| Dependência | Tipo | Status | Impacto se bloqueado |
|-------------|------|--------|----------------------|
| Contratos TypeScript existentes em `src/types/` | Interna | Existente | Afeta integração frontend/BFF e testes de contrato |
| Docker + Docker Compose disponível no ambiente de dev | Interna/Infra | Existente | Afeta todo o desenvolvimento |
| JDK 21 disponível no ambiente de dev | Interna/Infra | A configurar | Afeta todos os microserviços |
| Node.js disponível no ambiente de dev | Interna/Infra | Existente | Afeta BFF |
| Provedor WhatsApp/SMS (decisão) | Externa | A definir (pós-MVP) | Afeta US07 em produção; sandbox explícito no MVP |
| Ambiente de homologação com Docker | Interna/Infra | Pendente | Afeta milestone 6 |
| Fonte de dados para baseline de negócio | Interna | A levantar | Afeta critérios de aceite de negócio |
| Condomínio piloto para homologação | Externa | A definir | Afeta milestone 6 |

## 8. Referências

- EquipMap — Gestão de Condomínios: documento base com stack frontend, arquitetura, domínios, entidades, endpoints, regras de negócio, eventos e conexão frontend/backend.
- Prompt de geração de PRD: documento de orientação para estruturar PRDs autocontidos.
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/) — framework backend principal (microserviços).
- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/) — ORM/persistência.
- [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/docs/current/reference/html/) — integração com RabbitMQ.
- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/) — autenticação e autorização.
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/) — BFF GraphQL (Node.js).
- [RabbitMQ Documentation](https://www.rabbitmq.com/docs) — message broker.
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html) — storage S3-compatible para dev local.
- OAuth 2.0 Authorization Code Flow — referência para login social Google/Microsoft.
- [RFC 7807 - Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807) — base para formato de erro padronizado.
- Documentação do provedor WhatsApp/SMS — a definir pós-MVP.

## 9. Registro de Decisões

- **2026-05-18:** `condominium-service` será implementado com CRUD próprio. Motivo: necessário para gestão multi-tenant com associação de usuários e parametrização por condomínio (timezone, etc.).
- **2026-05-18:** Usuário pode pertencer a múltiplos condomínios. Seleção pós-login + claim `condominiumId` no JWT + switch via mutation dedicada. Motivo: segurança (claim assinado, não header manipulável) + boa UX (auto-select se um só, troca com 1 clique).
- **2026-05-18:** Infraestrutura agnóstica de cloud provider. Docker Compose para dev, abstrações de storage (S3-compatible) e configuração por variáveis de ambiente (12-factor). Motivo: flexibilidade para rodar em múltiplos cloud providers.
- **2026-05-18:** Formato padronizado de erro RFC 7807 simplificado com `statusCode`, `error`, `message`, `details`, `timestamp` e `traceId`. Motivo: padronização, rastreabilidade e debugging facilitado.
- **2026-05-18:** Soft delete para equipamentos com vínculos (manutenções/garantias). Motivo: preserva histórico operacional e auditabilidade.
- **2026-05-18:** Manutenção corretiva permite `completedDate < scheduledDate`; preventiva e preditiva exigem `completedDate >= scheduledDate`. Motivo: corretiva é reativa (emergência resolvida antes do registro formal).
- **2026-05-18:** Timezone parametrizável por condomínio, default `America/Sao_Paulo`. Motivo: suportar condomínios em fusos diferentes do Brasil.
- **2026-05-18:** Sorteio com seed registrado (Fisher-Yates + `java.util.Random(seed)`). Motivo: reprodutibilidade e auditoria matemática do resultado.
- **2026-05-18:** Quando apartamentos elegíveis > vagas disponíveis: sortear até o limite de vagas e registrar quem ficou de fora. Motivo: sorteio parcial é válido; registro de excedentes para transparência.
- **2026-05-18:** Brigadistas inativos ignorados silenciosamente em envio em massa. Motivo: não bloquear operação por conta de inativos; UX simplificada.
- **2026-05-18:** `NotificationLog` com registro individual por destinatário (não por lote). Motivo: rastreabilidade granular de sucesso/falha por brigadista.
- **2026-05-18:** Upload de documentos de garantia: PDF, JPG, JPEG, PNG, máximo 10 MB. Motivo: tipos mais comuns de NF e contratos; limite adequado para documentos digitalizados.
- **2026-05-18:** Exclusão de notificação é lógica e pessoal (apenas para o usuário autenticado). Motivo: notificações são pessoais; cada usuário gerencia as suas.
- **2026-05-18:** Refresh token em httpOnly cookie com rotação a cada uso. Motivo: mitigar XSS (token não acessível via JS) e detectar roubo (reuso de token rotacionado revoga família).
- **2026-05-19:** Stack atualizada — microserviços em Java 21 + Spring Boot (Spring Data JPA, Spring AMQP, Spring Security), BFF em Node.js + GraphQL (Apollo Server), frontend em React + TypeScript. Motivo: Java/Spring para robustez enterprise e virtual threads; BFF GraphQL para flexibilidade de consultas e isolamento do frontend da topologia de microserviços; comunicação BFF → serviços via REST.
- **2026-05-19:** Gradle (Kotlin DSL) como build tool para todos os projetos Java. Motivo: builds mais rápidos, DSL type-safe, melhor suporte a composite builds para dev local com `equipmap-core`.
- **2026-05-19:** 12 repositórios independentes (não monorepo). Motivo: deploy independente, ownership claro, pipelines isoladas, liberdade de versionamento por serviço.
- **2026-05-19:** `equipmap-core` como shared lib publicada via GitHub Packages + Gradle composite build local. Motivo: compartilhar DTOs de eventos e interfaces sem acoplamento; iteração rápida em dev.
- **2026-05-19:** Docker Compose por microserviço (autossuficiente). Motivo: cada repo sobe independente sem depender de repo externo.
- **2026-05-19:** Contract tests em dev, integração real em local/staging. Motivo: rapidez no ciclo de dev com validação real antes de release.
- **2026-05-19:** `graphql-codegen` no frontend como source of truth. Motivo: elimina types manuais; garante sincronia frontend↔BFF.
- **2026-05-19:** Admin global = usuário com role `admin` em todos os condomínios. Motivo: modelo uniforme RBAC sem flag especial.
- **2026-05-19:** Enums limpos no GraphQL + mapping no BFF. Motivo: type-safety; enums sem acentos/espaços no schema.
- **2026-05-19:** Seed data via Flyway migration (1 admin + 1 condomínio). Motivo: bootstrap mínimo para primeiro login.
- **2026-05-19:** Ajustes frontend distribuídos nos milestones. Motivo: cada milestone entrega ponta a ponta.
- **2026-05-19:** Entidades JPA modeladas: User, RefreshToken, Condominium, CondominiumUser, Equipment, OutboxEvent, MaintenanceRecord, Apartment, ParkingSpot, LotterySession, LotteryResult, Brigadier, NotificationLog. Motivo: design validado durante exploração arquitetural.
- **2026-05-20:** Configuração de `graphql-codegen` no frontend não deve combinar `typescript` com `typescript-operations`/`typescript-react-apollo` no mesmo arquivo `src/graphql/generated.tsx` quando isso reemitir tipos base. Motivo: evitar declarações duplicadas de enums/tipos (`AppNotificationType`) que quebram o Vite/Babel; enums gerados devem ser consumidos como unions literais e mapeados por strings do schema.
