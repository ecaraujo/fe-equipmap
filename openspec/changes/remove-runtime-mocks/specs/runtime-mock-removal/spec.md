## ADDED Requirements

### Requirement: Frontend Requires Real API Configuration
The frontend SHALL require `VITE_API_BASE_URL` to be configured for integrated runtime execution and SHALL NOT fall back to local mock data when the variable is missing.

#### Scenario: Missing API URL
- **WHEN** the frontend starts without `VITE_API_BASE_URL`
- **THEN** the application surfaces a clear configuration error instead of using local mock entities

#### Scenario: Configured API URL
- **WHEN** `VITE_API_BASE_URL` points to the BFF GraphQL endpoint
- **THEN** authentication, domain queries, and supported mutations use Apollo GraphQL operations

### Requirement: Frontend Mutations Do Not Use Local Mock State In Real Mode
The frontend SHALL NOT satisfy create, update, delete, complete, read, or notify operations by modifying local mock state when real API mode is configured.

#### Scenario: Unsupported Mutation
- **WHEN** a user triggers a frontend operation that has no backend mutation implemented
- **THEN** the application returns an explicit unsupported-operation error instead of pretending success locally

### Requirement: BFF Uses Real Services In Runtime
The BFF SHALL route runtime GraphQL operations to real microservice data sources and SHALL NOT use faker or in-memory mock stores as a fallback.

#### Scenario: Missing Service Configuration
- **WHEN** a required microservice URL is missing or invalid at BFF startup
- **THEN** the BFF fails fast with a clear configuration error

#### Scenario: Runtime Query
- **WHEN** a GraphQL query or mutation is executed in the integrated stack
- **THEN** the BFF resolves it through configured REST data sources

### Requirement: Messaging Sandbox Is Explicit
The brigadier-service SHALL use an explicitly named sandbox messaging provider for local/MVP delivery simulation and SHALL NOT register a generic mock provider as production runtime behavior.

#### Scenario: Local Sandbox Delivery
- **WHEN** the local or homologation environment sends brigadier notifications
- **THEN** the sandbox provider records deterministic delivery results through the normal worker and log flow

#### Scenario: Production Profile Without Provider
- **WHEN** a production-like profile starts without a configured real messaging provider
- **THEN** startup fails or the service marks messaging as unavailable with a clear configuration error

### Requirement: Test And Seed Data Remain Distinct From Runtime Mocks
The system MAY keep test doubles, Mockito-based unit tests, database seed users, and deterministic lottery seeds, but they SHALL be documented as test/dev fixtures rather than runtime mock fallback behavior.

#### Scenario: Homologation Search For Runtime Mocks
- **WHEN** maintainers search for runtime mock flags such as `useMock`, `MOCK_MODE`, or generic `Mock*Provider`
- **THEN** no production/runtime path depends on those flags or generic mock providers
