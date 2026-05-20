## ADDED Requirements

### Requirement: CRUD for maintenance records
The maintenance-service SHALL expose `GET /maintenance`, `GET /maintenance/:id`, `POST /maintenance`, `PUT /maintenance/:id`, `PATCH /maintenance/:id/complete`, `DELETE /maintenance/:id`.

#### Scenario: Create maintenance
- **WHEN** user creates maintenance with valid data including equipmentId and scheduledDate
- **THEN** service creates record with status `PENDING`

#### Scenario: Create maintenance without equipmentId
- **WHEN** user creates maintenance with equipment name text but no equipmentId
- **THEN** service creates record with textual snapshot, no auto-update link to equipment

### Requirement: Completion with date validation by type
The maintenance-service SHALL validate `completedDate` based on maintenance type. Preventive/Predictive require completedDate >= scheduledDate. Corrective allows any completedDate.

#### Scenario: Complete preventive maintenance early
- **WHEN** user completes preventive maintenance with completedDate before scheduledDate
- **THEN** service returns 400 validation error

#### Scenario: Complete corrective maintenance early
- **WHEN** user completes corrective maintenance with completedDate before scheduledDate
- **THEN** service accepts and marks as completed (corrective is reactive)

### Requirement: Optimistic locking on completion
The maintenance-service SHALL use JPA `@Version` for optimistic locking to prevent concurrent completion.

#### Scenario: Concurrent completion
- **WHEN** two users attempt to complete the same maintenance simultaneously
- **THEN** first succeeds, second receives 409 Conflict

### Requirement: Daily job marks overdue maintenance
The maintenance-service SHALL run a `@Scheduled` job daily that marks maintenance as `OVERDUE` when `scheduledDate < today` and status is `PENDING`. The job MUST be idempotent and timezone-aware (per condominium timezone).

#### Scenario: Job marks overdue items
- **WHEN** daily job runs and finds 3 pending maintenances with scheduledDate in the past
- **THEN** all 3 are marked `OVERDUE` and events `maintenance.overdue` are published

#### Scenario: Job runs twice same day
- **WHEN** job is triggered twice on the same dataset
- **THEN** no duplicate notifications are generated (idempotent)

### Requirement: Event publication on completion
The maintenance-service SHALL publish `maintenance.completed` event via RabbitMQ when a maintenance is completed, containing `maintenanceId`, `equipmentId`, `condominiumId`, `completedDate`.

#### Scenario: Completion event published
- **WHEN** maintenance is completed successfully
- **THEN** `maintenance.completed` event is published to RabbitMQ

#### Scenario: RabbitMQ failure on completion
- **WHEN** RabbitMQ is unavailable during completion
- **THEN** maintenance is still completed; event persisted in outbox for later delivery

### Requirement: Event publication for overdue maintenance
The maintenance-service SHALL publish `maintenance.overdue` events with `maintenanceId`, `equipmentId`, `condominiumId`, `scheduledDate`, and severity `high`.

#### Scenario: Overdue event consumed by notification-service
- **WHEN** `maintenance.overdue` event is published
- **THEN** notification-service creates alert with severity `high` for condominium users
