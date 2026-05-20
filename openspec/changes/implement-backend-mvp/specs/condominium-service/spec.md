## ADDED Requirements

### Requirement: CRUD for condominiums
The condominium-service SHALL expose REST endpoints for full CRUD of condominiums: `GET /condominiums`, `GET /condominiums/:id`, `POST /condominiums`, `PUT /condominiums/:id`, `DELETE /condominiums/:id`.

#### Scenario: Create condominium
- **WHEN** admin sends POST with valid condominium data (name, cnpj, address, timezone)
- **THEN** service creates condominium with default timezone `America/Sao_Paulo` if not specified and returns 201

#### Scenario: Duplicate CNPJ
- **WHEN** admin creates condominium with a CNPJ that already exists
- **THEN** service returns 409 Conflict

#### Scenario: Delete condominium with active dependencies
- **WHEN** admin attempts to delete condominium that has linked equipment/maintenance/warranties
- **THEN** service returns 400 with error indicating active dependencies

### Requirement: User-condominium association management
The condominium-service SHALL manage user associations via `GET /condominiums/:id/users`, `POST /condominiums/:id/users`, `DELETE /condominiums/:id/users/:userId`.

#### Scenario: Associate user to condominium
- **WHEN** admin/manager adds user to condominium with specified role
- **THEN** service creates association in `condominium_users` table

#### Scenario: Remove last admin
- **WHEN** attempt to remove the only admin of a condominium
- **THEN** service returns 400 blocking the operation

#### Scenario: Duplicate association
- **WHEN** user already associated to condominium is added again
- **THEN** service returns 409

### Requirement: Role-based listing filter
The condominium-service SHALL filter condominium listings by role: admin sees all, others see only their associated condominiums.

#### Scenario: Admin lists condominiums
- **WHEN** admin requests GET /condominiums
- **THEN** service returns all condominiums

#### Scenario: Manager lists condominiums
- **WHEN** manager requests GET /condominiums
- **THEN** service returns only condominiums where user is associated

### Requirement: Timezone configuration per condominium
Each condominium SHALL have a configurable `timezone` field (default `America/Sao_Paulo`) used by scheduled jobs across services.

#### Scenario: Invalid timezone
- **WHEN** condominium is created/updated with invalid timezone string
- **THEN** service returns 400 with suggested valid timezones

### Requirement: Only admin can manage condominiums
Only users with `admin` role SHALL be allowed to create, update, and delete condominiums. Admin and manager can manage user associations.

#### Scenario: Manager attempts condominium creation
- **WHEN** user with `manager` role sends POST /condominiums
- **THEN** service returns 403

#### Scenario: Manager associates user
- **WHEN** user with `manager` role sends POST /condominiums/:id/users
- **THEN** service creates the association successfully
