## ADDED Requirements

### Requirement: Apartment unit records are persisted with owner and tenant data
The system SHALL persist apartment/unit records per condominium with unit identification, owner data, tenant data when rented, contact information, parking eligibility, audit timestamps, and soft deletion.

#### Scenario: Create owner-occupied apartment
- **WHEN** an authorized admin or manager creates an apartment with unit, block, owner name, owner contact, and `isRented = false`
- **THEN** the system persists the apartment for the authenticated condominium and returns the saved record from the backend.

#### Scenario: Create rented apartment with tenant contact
- **WHEN** an authorized admin or manager creates an apartment with `isRented = true`, tenant name, and at least one tenant contact
- **THEN** the system persists owner and tenant data and returns the saved record through the BFF.

#### Scenario: Reject rented apartment without tenant data
- **WHEN** an authorized user submits `isRented = true` without tenant name or tenant contact
- **THEN** the system rejects the request with a validation error and does not persist the apartment.

### Requirement: Apartment unit uniqueness is enforced per condominium
The system SHALL prevent duplicate active apartment/unit records for the same `condominiumId`, `unit`, and `block`.

#### Scenario: Duplicate active apartment
- **WHEN** an authorized user creates or updates an apartment to a `unit + block` combination that already exists as an active record in the same condominium
- **THEN** the system returns a conflict error and preserves the existing data unchanged.

#### Scenario: Same unit in different condominium
- **WHEN** two authenticated condominiums create the same `unit + block` combination
- **THEN** the system allows both records because they belong to different `condominiumId` values.

### Requirement: Apartment unit contract is exposed through the BFF
The BFF SHALL expose apartment/unit queries and mutations that include all persisted apartment fields and SHALL not discard persisted fields such as owner contacts, tenant contacts, floor, rental dates, or observations.

#### Scenario: Query apartment units
- **WHEN** the frontend queries apartment/unit records through GraphQL
- **THEN** the BFF returns the records from the real `parking-service` with the complete apartment contract.

#### Scenario: Mutate apartment unit
- **WHEN** the frontend creates or updates an apartment/unit through GraphQL
- **THEN** the BFF forwards the normalized payload to the real `parking-service` and returns the saved backend response.

### Requirement: Apartment registration has two shared UI entry points
The frontend SHALL expose apartment/unit registration as a standalone `Apartamentos` module below `Garantias` and SHALL keep apartment registration available inside `Sorteio de Vagas`.

#### Scenario: Navigate to standalone apartments module
- **WHEN** an authenticated user opens the main navigation
- **THEN** the user can select `Apartamentos` below `Garantias` and manage apartment/unit records using real backend data.

#### Scenario: Manage apartments inside parking lottery
- **WHEN** an authenticated user opens `Sorteio de Vagas`
- **THEN** the user can still create, edit, list, and delete apartments from the parking workflow using the same shared apartment components and mutations.

### Requirement: Apartment forms normalize phone and date values
The frontend SHALL display phone fields as `(xx)xxxxx-xxxx`, send phone values as digits only, and send rental date values to the BFF as ISO `yyyy-MM-dd`.

#### Scenario: Submit masked phone
- **WHEN** a user fills an owner or tenant phone field with a visible mask
- **THEN** the GraphQL mutation sends only digits to the BFF.

#### Scenario: Submit rental dates
- **WHEN** a user fills rental start or rental end dates
- **THEN** the GraphQL mutation sends date-only ISO values in `yyyy-MM-dd` format.

### Requirement: Apartment data remains compatible with parking lottery
Apartment/unit changes SHALL preserve parking lottery behavior, including `hasVehicle`, active apartment filtering, lottery result snapshots, reset behavior, and transaction safety.

#### Scenario: Apartment without vehicle
- **WHEN** an apartment has `hasVehicle = false`
- **THEN** it appears in the apartment module but is excluded from parking lottery eligibility.

#### Scenario: Apartment used in lottery is deleted
- **WHEN** an apartment already referenced by lottery history is deleted
- **THEN** the system soft deletes the apartment and keeps previous lottery result snapshots readable.
