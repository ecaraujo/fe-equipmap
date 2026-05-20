## ADDED Requirements

### Requirement: CRUD for warranties with dynamic status
The warranty-service SHALL expose `GET /warranties`, `GET /warranties/:id`, `POST /warranties`, `PUT /warranties/:id`, `DELETE /warranties/:id`. Status SHALL be calculated dynamically: `EXPIRED` if warrantyEnd < today, `EXPIRING` if within 90 days, `ACTIVE` otherwise.

#### Scenario: List warranties with calculated status
- **WHEN** user queries warranties and one has warrantyEnd = today + 30 days
- **THEN** that warranty is returned with status `EXPIRING`

#### Scenario: Invalid date range
- **WHEN** warrantyEnd is before warrantyStart
- **THEN** service returns 400

### Requirement: Document upload via pre-signed URL
The warranty-service SHALL support document upload via pre-signed URL: `POST /warranties/:id/upload-url` generates URL, frontend uploads directly to storage, then `POST /warranties/:id/confirm-upload` validates and links document.

#### Scenario: Successful upload flow
- **WHEN** user requests upload URL for a PDF file
- **THEN** service generates pre-signed URL (MinIO/S3-compatible); after frontend upload, confirm-upload validates and stores reference

#### Scenario: File exceeds 10MB
- **WHEN** file size exceeds 10MB
- **THEN** service returns 413

#### Scenario: Invalid file type
- **WHEN** file is not PDF, JPG, JPEG, or PNG
- **THEN** service returns 400 with accepted types list

#### Scenario: Storage failure
- **WHEN** MinIO/S3 is unavailable during upload
- **THEN** service returns 502 without creating invalid document reference

### Requirement: MIME type validation on backend
The warranty-service SHALL validate actual MIME type of uploaded files (not just extension).

#### Scenario: Extension mismatch
- **WHEN** file has .pdf extension but binary content is not PDF
- **THEN** service rejects with 400

### Requirement: Daily job for warranty expiration alerts
The warranty-service SHALL run a `@Scheduled` daily job that publishes `warranty.expiring` (within 90 days) and `warranty.expired` events via RabbitMQ. Job MUST be idempotent and timezone-aware.

#### Scenario: Warranty expiring in 30 days
- **WHEN** daily job finds warranty expiring in 30 days
- **THEN** publishes `warranty.expiring` event with severity `medium`

#### Scenario: Warranty already expired
- **WHEN** daily job finds warranty past warrantyEnd
- **THEN** publishes `warranty.expired` event with severity `high`

#### Scenario: Deduplication
- **WHEN** job runs and warranty was already notified as expiring
- **THEN** no duplicate event is published (deduplication by type + resourceId + condominiumId)

### Requirement: StorageService interface abstraction
The warranty-service SHALL use a `StorageService` interface from `equipmap-core` for all storage operations, supporting any S3-compatible backend.

#### Scenario: Switch storage provider
- **WHEN** environment is configured for AWS S3 instead of MinIO
- **THEN** service operates identically using the S3-compatible interface
