## ADDED Requirements

### Requirement: Consume events and create notifications
The notification-service SHALL consume events via `@RabbitListener` (maintenance.overdue, maintenance_pending, warranty.expiring, warranty.expired) and create notification records for affected users.

#### Scenario: Maintenance overdue event
- **WHEN** `maintenance.overdue` event is received
- **THEN** notification is created with type `maintenance_overdue`, severity `high`, for users of that condominium

#### Scenario: Warranty expiring event
- **WHEN** `warranty.expiring` event is received
- **THEN** notification is created with type `warranty_expiring`, severity `medium`, for users of that condominium

### Requirement: Deduplication by business key
The notification-service SHALL deduplicate notifications using composite key: `type + resourceId + userId + condominiumId`. Duplicate events MUST NOT create duplicate active notifications.

#### Scenario: Duplicate event received
- **WHEN** same maintenance.overdue event arrives twice for same resource
- **THEN** only one notification exists (second is ignored)

#### Scenario: Resource resolved then new event
- **WHEN** notification was deleted (logically) and new event arrives for same resource
- **THEN** new notification is created (previous was soft-deleted)

### Requirement: List notifications for authenticated user
The notification-service SHALL expose `GET /notifications` filtered by authenticated userId and condominiumId from JWT.

#### Scenario: User sees only their notifications
- **WHEN** user queries notifications
- **THEN** only notifications matching their userId and active condominiumId are returned

### Requirement: Mark notification as read
The notification-service SHALL expose `PATCH /notifications/:id/read` and `PATCH /notifications/read-all` for the authenticated user.

#### Scenario: Mark single notification read
- **WHEN** user marks notification as read
- **THEN** notification's `read` field is set to true

#### Scenario: Mark all notifications read
- **WHEN** user triggers read-all
- **THEN** all unread notifications for that user/condominium are marked read

#### Scenario: Already read notification
- **WHEN** user marks already-read notification as read
- **THEN** operation is idempotent, returns 200

### Requirement: Personal logical deletion
The notification-service SHALL expose `DELETE /notifications/:id` as logical deletion for the authenticated user only. Other users' view is unaffected.

#### Scenario: Delete own notification
- **WHEN** user deletes their notification
- **THEN** notification is soft-deleted for that user only

#### Scenario: Delete another user's notification
- **WHEN** user attempts to delete notification belonging to another user
- **THEN** service returns 403

### Requirement: Severity mapping
The notification-service SHALL map event types to severity: maintenance_overdue → high, warranty_expired → high, maintenance_pending → medium, warranty_expiring → medium.

#### Scenario: Correct severity assignment
- **WHEN** `warranty.expired` event is consumed
- **THEN** notification is created with severity `high`

### Requirement: Reliable event consumption
The notification-service SHALL use manual acknowledgment (`AcknowledgeMode.MANUAL`) and persistent messages to ensure no events are lost.

#### Scenario: Service restart during processing
- **WHEN** notification-service crashes while processing an event
- **THEN** unacknowledged event is redelivered by RabbitMQ after restart

#### Scenario: RabbitMQ recovery
- **WHEN** RabbitMQ recovers from outage
- **THEN** pending persistent messages are delivered to notification-service
