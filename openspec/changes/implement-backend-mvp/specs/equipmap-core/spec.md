## ADDED Requirements

### Requirement: Shared event DTOs
The equipmap-core library SHALL contain all event DTO classes used for inter-service communication via RabbitMQ (e.g., MaintenanceCompletedEvent, WarrantyExpiringEvent, etc.).

#### Scenario: Service publishes event using shared DTO
- **WHEN** maintenance-service publishes a completion event
- **THEN** it uses `MaintenanceCompletedEvent` DTO from equipmap-core, ensuring type consistency with consumers

### Requirement: Shared interfaces for infrastructure abstractions
The equipmap-core library SHALL define interfaces `StorageService` and `MessagingProvider` that services implement.

#### Scenario: StorageService interface used by warranty-service
- **WHEN** warranty-service needs to generate pre-signed URL
- **THEN** it depends on `StorageService` interface from equipmap-core, with implementation provided by Spring DI

#### Scenario: MessagingProvider interface used by brigadier-service
- **WHEN** brigadier-service needs to send WhatsApp/SMS
- **THEN** it depends on `MessagingProvider` interface from equipmap-core

### Requirement: Shared error handling utilities
The equipmap-core library SHALL provide standardized error response classes following RFC 7807 simplified format (statusCode, error, message, details, timestamp, traceId).

#### Scenario: Service returns standardized error
- **WHEN** any microservice encounters a validation error
- **THEN** it uses error classes from equipmap-core to format the response consistently

### Requirement: Shared constants and enums
The equipmap-core library SHALL contain shared constants (event routing keys, queue names) and enum definitions used across services.

#### Scenario: Queue name consistency
- **WHEN** maintenance-service publishes to a queue and notification-service consumes
- **THEN** both reference the same queue name constant from equipmap-core

### Requirement: Published via Maven registry with Gradle composite build
The equipmap-core SHALL be published to GitHub Packages (Maven registry) for CI/CD. For local development, Gradle composite build SHALL allow editing core and services simultaneously without publishing.

#### Scenario: Local development with composite build
- **WHEN** developer edits a DTO in equipmap-core
- **THEN** dependent service immediately sees changes without needing to publish (Gradle composite build)

#### Scenario: CI build uses published version
- **WHEN** CI pipeline builds auth-service
- **THEN** it resolves equipmap-core from GitHub Packages Maven registry using semantic version

### Requirement: Minimal scope — no business logic
The equipmap-core library SHALL contain only DTOs, interfaces, constants, and error utilities. It MUST NOT contain business logic or service implementations.

#### Scenario: Attempt to add business logic
- **WHEN** developer considers adding validation rules to equipmap-core
- **THEN** validation logic belongs in the specific service, not the shared lib
