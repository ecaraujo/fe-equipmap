## ADDED Requirements

### Requirement: CRUD for equipment with filters and pagination
The equipment-service SHALL expose `GET /equipment` (with filters: search, type, status, page, pageSize), `GET /equipment/:id`, `POST /equipment`, `PUT /equipment/:id`, `DELETE /equipment/:id`.

#### Scenario: List equipment with filters
- **WHEN** user queries `GET /equipment?type=CLIMATIZATION&status=ACTIVE&page=1&pageSize=20`
- **THEN** service returns paginated list of matching equipment for the user's condominium

#### Scenario: Equipment not found
- **WHEN** user queries non-existent equipment ID
- **THEN** service returns 404

### Requirement: Automatic patrimonyCode generation unique per condominium
The equipment-service SHALL auto-generate `patrimonyCode` that is unique within a condominium. Concurrent creation attempts with the same code MUST be handled transactionally.

#### Scenario: Concurrent duplicate patrimonyCode
- **WHEN** two users simultaneously create equipment that would result in same patrimonyCode
- **THEN** service maintains transactional uniqueness; second request returns 409

### Requirement: Soft delete preserving history
DELETE SHALL perform soft delete (set `deletedAt` timestamp). Soft-deleted equipment MUST NOT appear in standard listings but MUST remain accessible via specific filter.

#### Scenario: Soft delete equipment
- **WHEN** user deletes equipment with linked maintenance/warranty records
- **THEN** equipment is marked with `deletedAt`, disappears from default listing, but history is preserved

#### Scenario: Query deleted equipment
- **WHEN** user queries with `includeDeleted=true` filter
- **THEN** soft-deleted equipment appears in results

### Requirement: Event publication via Transactional Outbox
The equipment-service SHALL use Transactional Outbox Pattern (outbox_events table) for reliable event publication to RabbitMQ.

#### Scenario: Event published after warranty update
- **WHEN** equipment's `warrantyExpiry` is updated
- **THEN** event `equipment.warranty_expiring` is persisted in outbox table within same transaction and subsequently published to RabbitMQ

#### Scenario: RabbitMQ temporarily unavailable
- **WHEN** RabbitMQ is down during event publication
- **THEN** event remains in outbox table and is published on next polling cycle

### Requirement: Automatic status change to Alert on overdue maintenance
The equipment-service SHALL set status to `ALERT` when `nextMaintenance` date is in the past.

#### Scenario: Next maintenance overdue
- **WHEN** equipment's `nextMaintenance` date passes
- **THEN** equipment status changes to `ALERT` and event `equipment.maintenance_due` is published

### Requirement: Consume maintenance.completed event
The equipment-service SHALL consume `maintenance.completed` events and update the `lastMaintenance` field of the related equipment.

#### Scenario: Maintenance completed
- **WHEN** `maintenance.completed` event is received with equipmentId
- **THEN** equipment's `lastMaintenance` is updated to the completion date

### Requirement: Data validation rules
The equipment-service SHALL enforce: nextMaintenance >= acquisitionDate, value >= 0, required fields present.

#### Scenario: Invalid nextMaintenance date
- **WHEN** nextMaintenance is before acquisitionDate
- **THEN** service returns 400 with validation message

#### Scenario: Negative value
- **WHEN** equipment value is negative
- **THEN** service returns 400
