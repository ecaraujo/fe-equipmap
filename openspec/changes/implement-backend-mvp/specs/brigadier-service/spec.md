## ADDED Requirements

### Requirement: CRUD for brigadiers with filters
The brigadier-service SHALL expose `GET /brigadiers` (filters: name, role, status), `GET /brigadiers/:id`, `POST /brigadiers`, `PUT /brigadiers/:id`, `DELETE /brigadiers/:id`.

#### Scenario: List brigadiers by role
- **WHEN** user queries brigadiers with filter role=CHIEF
- **THEN** service returns only brigadiers with role `Brigadista Chefe`

#### Scenario: Create brigadier
- **WHEN** manager creates brigadier with name, role, phone, certificationDate, certificationExpiry
- **THEN** service creates brigadier record for the condominium

### Requirement: Certification monitoring
The brigadier-service SHALL calculate certification status dynamically: `EXPIRING` if within 90 days of expiry, `EXPIRED` if past certificationExpiry.

#### Scenario: Certification expiring
- **WHEN** brigadier's certificationExpiry is 45 days from now
- **THEN** certification status is calculated as `EXPIRING`

#### Scenario: Certification expired
- **WHEN** brigadier's certificationExpiry is in the past
- **THEN** certification status is calculated as `EXPIRED`

### Requirement: Async mass notification via RabbitMQ
The brigadier-service SHALL accept `POST /brigadiers/notify` with message and recipient list, enqueue messages via RabbitMQ, and process asynchronously with `@RabbitListener`.

#### Scenario: Successful mass notification
- **WHEN** manager sends notification to 10 active brigadiers
- **THEN** service enqueues 10 individual messages to RabbitMQ; worker processes each and creates NotificationLog per recipient

#### Scenario: Inactive brigadiers silently excluded
- **WHEN** notification targets include 3 inactive brigadiers
- **THEN** inactive brigadiers are silently excluded; only active ones receive messages

### Requirement: Individual NotificationLog per recipient
Each notification attempt SHALL create one `NotificationLog` record per recipient with status `sent` or `failed`.

#### Scenario: Mixed delivery results
- **WHEN** 5 messages are sent: 3 succeed, 2 fail (invalid phone)
- **THEN** 3 logs with status `sent` and 2 logs with status `failed` are created

### Requirement: MessagingProvider interface (Strategy Pattern)
The brigadier-service SHALL use `MessagingProvider` interface with implementations for WhatsApp and SMS. MVP uses mock/sandbox implementation.

#### Scenario: Provider swap
- **WHEN** environment is configured for production WhatsApp provider
- **THEN** service uses real WhatsApp implementation via Spring DI without code changes

### Requirement: Retry via dead-letter queue
Failed message deliveries SHALL be retried via RabbitMQ dead-letter queue with configurable retry count.

#### Scenario: Temporary provider failure
- **WHEN** WhatsApp provider returns temporary error
- **THEN** message is sent to DLQ and retried on next cycle

#### Scenario: Permanent failure after max retries
- **WHEN** message fails after maximum retry attempts
- **THEN** NotificationLog is updated to `failed` with error details

### Requirement: Validation before enqueuing
The brigadier-service SHALL validate message content and recipient list before enqueuing.

#### Scenario: Empty message
- **WHEN** notification request has empty message body
- **THEN** service returns 400 without enqueuing

#### Scenario: No active recipients
- **WHEN** all selected brigadiers are inactive
- **THEN** service returns 400
