# EquipMap — Gestão de Condomínios

Aplicação web para gestão de equipamentos, manutenções, garantias e operações de condomínios residenciais, construída com React 18 + TypeScript + Tailwind CSS v4.

---

## Stack Frontend

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Framework principal |
| Tailwind CSS v4 | Estilização |
| Vite | Build tool |
| Radix UI / shadcn | Componentes de UI |
| motion/react | Animações |
| recharts | Gráficos |
| lucide-react | Ícones |

---

## Arquitetura Frontend

O projeto segue o padrão **Repository + Service Layer**, separando a lógica de dados da apresentação:

```
src/
├── config/          # Configuração da API (baseUrl, endpoints, mock/real switch)
├── types/           # Contratos TypeScript (Entities, DTOs, Filters)
├── services/        # Camada de serviço (Interface → Mock → API Implementation)
├── hooks/           # Custom hooks de acesso a dados
├── contexts/        # React Context (Auth, Notifications)
└── app/             # Componentes e páginas
```

### Variáveis de ambiente

```bash
# .env
VITE_API_BASE_URL=          # Vazio = usa mock data; preenchido = usa API real
VITE_API_TIMEOUT=10000
VITE_AUTH_TOKEN_TYPE=Bearer
VITE_AUTH_TOKEN_KEY=equipmap_auth_token
VITE_APP_ENV=development
```

---

## Domínios de Backend (Microserviços)

A seguir estão os **7 domínios** identificados na aplicação que precisam ser implementados como microserviços independentes.

---

### 1. `auth-service` — Autenticação e Autorização

**Responsabilidade:** Gerenciar autenticação de usuários, emissão de tokens JWT e integração com provedores sociais.

#### Entidades

```
User
  id              String
  name            String
  email           String (único)
  role            Enum: admin | manager | viewer
  avatar          String? (URL)
  condominiumId   String? (FK → condominium-service)
  condominiumName String?
  createdAt       DateTime
  updatedAt       DateTime
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login com email e senha |
| `POST` | `/auth/logout` | Encerra a sessão |
| `GET` | `/auth/me` | Retorna o usuário autenticado |
| `POST` | `/auth/refresh` | Renova o access token via refresh token |
| `POST` | `/auth/social/google` | Login OAuth via Google |
| `POST` | `/auth/social/microsoft` | Login OAuth via Microsoft |

#### DTOs

```typescript
LoginCredentials   { email: string; password: string }
AuthResponse       { user: User; token: string; refreshToken?: string }
SocialProvider     "google" | "microsoft"
```

#### Regras de negócio
- Access token com expiração curta (15min); refresh token de longa duração (7 dias)
- Roles definem permissões: `admin` acesso total, `manager` leitura/escrita, `viewer` somente leitura
- Login social utiliza OAuth 2.0 (Authorization Code Flow)

---

### 2. `equipment-service` — Inventário de Equipamentos

**Responsabilidade:** CRUD completo do inventário de equipamentos do condomínio, com controle de patrimônio, status e histórico.

#### Entidades

```
Equipment
  id              String
  name            String
  type            Enum: Climatização | Transporte | Elétrica | Hidráulica | Segurança | Outros
  brand           String
  model           String
  serialNumber    String
  patrimonyCode   String (único por condomínio)
  location        String
  status          Enum: Ativo | Manutenção | Alerta | Inativo
  acquisitionDate String
  warrantyExpiry  String
  lastMaintenance String?
  nextMaintenance String
  value           Decimal
  condominiumId   String (FK)
  createdAt       DateTime
  updatedAt       DateTime
  createdBy       String?
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/equipment` | Lista equipamentos com filtros e paginação |
| `GET` | `/equipment/:id` | Busca equipamento por ID |
| `POST` | `/equipment` | Cadastra novo equipamento |
| `PUT` | `/equipment/:id` | Atualiza equipamento |
| `DELETE` | `/equipment/:id` | Remove equipamento |

#### Query params (GET /equipment)
`search`, `type`, `status`, `page`, `pageSize`

#### DTOs

```typescript
CreateEquipmentDto {
  name, type, brand, model, serialNumber,
  location, status, acquisitionDate,
  warrantyExpiry, nextMaintenance, value
}
UpdateEquipmentDto  Partial<CreateEquipmentDto>
```

#### Regras de negócio
- `patrimonyCode` gerado automaticamente e único por condomínio
- Ao alterar `nextMaintenance`, publicar evento para o `maintenance-service`
- Ao vencer `warrantyExpiry`, publicar evento para o `notification-service`
- Status `Alerta` disparado automaticamente quando `nextMaintenance` estiver vencido

---

### 3. `maintenance-service` — Controle de Manutenções

**Responsabilidade:** Agendamento, acompanhamento e conclusão de manutenções preventivas, corretivas e preditivas.

#### Entidades

```
MaintenanceRecord
  id             String
  equipment      String (nome snapshot)
  equipmentId    String (FK → equipment-service)
  type           Enum: Preventiva | Corretiva | Preditiva
  status         Enum: Pendente | Em andamento | Concluída | Atrasada | Cancelada
  scheduledDate  String
  completedDate  String?
  technician     String?
  provider       String?
  description    String
  cost           Decimal?
  observations   String?
  condominiumId  String (FK)
  createdAt      DateTime
  updatedAt      DateTime
  createdBy      String?
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/maintenance` | Lista manutenções com filtros |
| `GET` | `/maintenance/:id` | Busca manutenção por ID |
| `POST` | `/maintenance` | Agenda nova manutenção |
| `PUT` | `/maintenance/:id` | Atualiza manutenção |
| `PATCH` | `/maintenance/:id/complete` | Marca como concluída |
| `DELETE` | `/maintenance/:id` | Remove manutenção |

#### Query params (GET /maintenance)
`search`, `status`, `type`, `page`, `pageSize`

#### DTOs

```typescript
CreateMaintenanceDto {
  equipment, equipmentId?, type,
  scheduledDate, technician?, provider?, description
}
CompleteMaintenanceDto { completedDate, cost?, observations? }
UpdateMaintenanceDto    Partial<CreateMaintenanceDto>
```

#### Regras de negócio
- Status `Atrasada` aplicado automaticamente via job agendado quando `scheduledDate < hoje` e status ainda `Pendente`
- Ao concluir (`PATCH /complete`), atualizar `lastMaintenance` no `equipment-service`
- Publicar evento de alerta para `notification-service` em manutenções atrasadas e pendentes

---

### 4. `warranty-service` — Controle de Garantias

**Responsabilidade:** Gerenciar garantias de equipamentos, calcular status de vencimento e alertar sobre expiração.

#### Entidades

```
Warranty
  id              String
  equipment       String (nome snapshot)
  equipmentId     String (FK → equipment-service)
  brand           String
  model           String
  serialNumber    String?
  supplier        String
  supplierContact String?
  purchaseDate    String
  warrantyStart   String
  warrantyEnd     String
  warrantyMonths  Int?
  type            Enum: Fabricante | Fornecedor | Estendida | Serviço
  status          Enum: Vigente | Vencendo | Vencida (calculado)
  observations    String?
  documentUrl     String?
  condominiumId   String (FK)
  createdAt       DateTime
  updatedAt       DateTime
  createdBy       String?
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/warranties` | Lista garantias com filtros |
| `GET` | `/warranties/:id` | Busca garantia por ID |
| `POST` | `/warranties` | Cadastra nova garantia |
| `PUT` | `/warranties/:id` | Atualiza garantia |
| `DELETE` | `/warranties/:id` | Remove garantia |

#### Query params (GET /warranties)
`search`, `status`, `type`, `page`, `pageSize`

#### DTOs

```typescript
CreateWarrantyDto {
  equipment, equipmentId?, brand, model, serialNumber?,
  supplier, supplierContact?, purchaseDate,
  warrantyStart, warrantyEnd, warrantyMonths?, type, observations?
}
UpdateWarrantyDto  Partial<CreateWarrantyDto>
```

#### Regras de negócio
- `status` é **calculado** dinamicamente: `Vencendo` = vence em ≤ 90 dias; `Vencida` = `warrantyEnd < hoje`
- Job diário verifica garantias prestes a vencer e publica eventos para `notification-service`
- Upload de documento (NF, contrato) integrado com serviço de armazenamento (S3 ou similar)

---

### 5. `parking-service` — Sorteio de Vagas de Garagem

**Responsabilidade:** Cadastro de apartamentos e vagas, execução do sorteio aleatório e persistência dos resultados.

#### Entidades

```
Apartment
  id          String
  unit        String
  block       String
  ownerName   String
  phone       String
  email       String?
  floor       Int
  hasVehicle  Boolean
  condominiumId String (FK)
  createdAt   DateTime
  updatedAt   DateTime

ParkingSpot
  id          String
  number      String
  type        Enum: Padrão | Deficiente | Moto | Especial
  covered     Boolean
  floor       String
  assignedTo  String? (FK → Apartment)
  condominiumId String (FK)
  createdAt   DateTime
  updatedAt   DateTime

LotteryResult
  id          String
  apartmentId String (FK → Apartment)
  spotId      String (FK → ParkingSpot)
  unit        String (snapshot)
  block       String (snapshot)
  ownerName   String (snapshot)
  spotNumber  String (snapshot)
  spotType    String (snapshot)
  drawnAt     DateTime
  condominiumId String (FK)
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/parking/apartments` | Lista apartamentos |
| `POST` | `/parking/apartments` | Cadastra apartamento |
| `PUT` | `/parking/apartments/:id` | Atualiza apartamento |
| `DELETE` | `/parking/apartments/:id` | Remove apartamento |
| `GET` | `/parking/spots` | Lista vagas |
| `POST` | `/parking/spots` | Cadastra vaga |
| `PUT` | `/parking/spots/:id` | Atualiza vaga |
| `DELETE` | `/parking/spots/:id` | Remove vaga |
| `GET` | `/parking/results` | Lista resultados do sorteio |
| `POST` | `/parking/lottery` | Executa o sorteio |
| `DELETE` | `/parking/lottery` | Reseta os resultados |

#### DTOs

```typescript
CreateApartmentDto { unit, block, ownerName, phone, email?, floor, hasVehicle }
UpdateApartmentDto  Partial<CreateApartmentDto>
CreateSpotDto      { number, type, covered, floor }
UpdateSpotDto       Partial<CreateSpotDto>
```

#### Regras de negócio
- Apenas apartamentos com `hasVehicle: true` participam do sorteio
- Apartamentos já sorteados não participam de novas rodadas até reset
- O sorteio é **atômico**: ou todos os pares são persistidos ou nenhum (transação)
- Snapshots dos dados são gravados em `LotteryResult` para garantir histórico imutável

---

### 6. `brigadier-service` — Gestão de Brigadistas

**Responsabilidade:** Cadastro de brigadistas, controle de certificações e envio de notificações em massa via WhatsApp e SMS.

#### Entidades

```
Brigadier
  id                  String
  name                String
  apartment           String
  block               String
  phone               String
  role                Enum: Brigadista | Brigadista Chefe | Sub-Chefe
  certificationDate   String
  certificationExpiry String
  certificationBody   String
  active              Boolean
  observations        String?
  condominiumId       String (FK)
  createdAt           DateTime
  updatedAt           DateTime

NotificationLog
  id           String
  channel      Enum: whatsapp | sms
  recipients   String[] (nomes dos destinatários)
  message      String
  sentAt       DateTime
  status       Enum: sent | failed
  condominiumId String (FK)
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/brigadiers` | Lista brigadistas (com filtro por nome/função) |
| `GET` | `/brigadiers/:id` | Busca brigadista por ID |
| `POST` | `/brigadiers` | Cadastra brigadista |
| `PUT` | `/brigadiers/:id` | Atualiza brigadista |
| `DELETE` | `/brigadiers/:id` | Remove brigadista |
| `POST` | `/brigadiers/notify` | Envia notificação (WhatsApp/SMS) |
| `GET` | `/brigadiers/notify/logs` | Lista histórico de envios |

#### DTOs

```typescript
CreateBrigadierDto {
  name, apartment, block, phone, role,
  certificationDate, certificationExpiry,
  certificationBody, active, observations?
}
UpdateBrigadierDto   Partial<CreateBrigadierDto>
SendNotificationDto  { channel: "whatsapp" | "sms"; recipientIds: string[]; message: string }
```

#### Regras de negócio
- `certificationExpiry` é monitorado: `Vencendo` = ≤ 90 dias; `Vencida` = data passada
- Envio via **WhatsApp**: integração com WhatsApp Business API (ex: Twilio, Z-API, Evolution API)
- Envio via **SMS**: integração com gateway SMS (ex: Twilio, Zenvia, Infobip)
- Todo envio é registrado em `NotificationLog` independente do resultado
- Notificações em lote são enviadas de forma assíncrona (fila de mensagens)

---

### 7. `notification-service` — Central de Alertas

**Responsabilidade:** Agregar e distribuir alertas internos do sistema originados pelos demais serviços (manutenções atrasadas, garantias vencendo etc.).

#### Entidades

```
AppNotification
  id          String
  type        Enum: maintenance_overdue | maintenance_pending | warranty_expiring | warranty_expired
  title       String
  description String
  severity    Enum: high | medium | low
  date        DateTime?
  read        Boolean (default: false)
  userId      String (FK → auth-service)
  condominiumId String (FK)
  createdAt   DateTime
```

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/notifications` | Lista notificações do usuário autenticado |
| `PATCH` | `/notifications/:id/read` | Marca notificação como lida |
| `PATCH` | `/notifications/read-all` | Marca todas como lidas |
| `DELETE` | `/notifications/:id` | Remove notificação |

#### Mapeamento de severidade

| Tipo | Severidade |
|---|---|
| `maintenance_overdue` | `high` |
| `warranty_expired` | `high` |
| `maintenance_pending` | `medium` |
| `warranty_expiring` | `medium` |

#### Regras de negócio
- Notificações são criadas por eventos publicados pelos demais serviços (via message broker)
- Um job diário varre manutenções e garantias para gerar/atualizar alertas
- Suporte futuro a WebSocket para entrega em tempo real

---

## Visão Geral dos Domínios

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                              │
│                  (autenticação, roteamento)                     │
└────────┬────────┬────────┬────────┬────────┬────────┬──────────┘
         │        │        │        │        │        │
    auth  equip  maint  warranty parking  brig    notif
   service service service service service service service
         │        │        │        │        │        │
         └────────┴────────┴────────┴────────┴────────┘
                           │
                    Message Broker
                 (eventos entre serviços)
```

### Eventos publicados entre serviços

| Produtor | Evento | Consumidor |
|---|---|---|
| `equipment-service` | `equipment.warranty_expiring` | `notification-service` |
| `equipment-service` | `equipment.maintenance_due` | `notification-service` |
| `maintenance-service` | `maintenance.overdue` | `notification-service` |
| `maintenance-service` | `maintenance.completed` | `equipment-service` |
| `warranty-service` | `warranty.expiring` | `notification-service` |
| `warranty-service` | `warranty.expired` | `notification-service` |

---

## Conectando o Frontend ao Backend

Para conectar o frontend à API real, basta definir a variável de ambiente:

```bash
VITE_API_BASE_URL=https://api.equipmap.com.br
```

Sem ela, a aplicação roda em modo **mock** com dados locais, sem necessidade de backend.

Todos os contratos de dados (DTOs, interfaces, filtros) estão definidos em `src/types/` e refletem exatamente o que cada endpoint deve receber e retornar.
