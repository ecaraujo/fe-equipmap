## ADDED Requirements

### Requirement: BFF exposes GraphQL schema as single entry point
The BFF SHALL serve as the sole entry point for the frontend, exposing a unified GraphQL schema via Apollo Server. All frontend requests MUST go through the BFF.

#### Scenario: Frontend queries BFF successfully
- **WHEN** frontend sends a GraphQL query with valid Authorization header
- **THEN** BFF resolves the query and returns data in the expected schema shape

#### Scenario: BFF validates JWT on every request
- **WHEN** a request arrives without valid JWT (missing, expired, or tampered)
- **THEN** BFF returns a 401 GraphQL error without forwarding to any microservice

### Requirement: BFF implements rate limiting
The BFF SHALL implement rate limiting per IP and per authenticated user to prevent abuse.

#### Scenario: Rate limit exceeded
- **WHEN** a client exceeds the configured request rate
- **THEN** BFF returns HTTP 429 with a GraphQL error and `Retry-After` header

### Requirement: BFF implements CORS restriction
The BFF SHALL restrict CORS to the frontend domain only.

#### Scenario: Request from unauthorized origin
- **WHEN** a request arrives from an origin not matching the allowed frontend domain
- **THEN** BFF rejects the request with appropriate CORS error

### Requirement: BFF orchestrates REST calls to microservices
The BFF SHALL translate GraphQL queries/mutations into REST calls to the appropriate microservices. In mock mode (Fase A), resolvers SHALL return faker/factory data with the same shape as real responses.

#### Scenario: BFF resolves query via microservice (real mode)
- **WHEN** frontend sends a query for equipment data and BFF is configured for real mode
- **THEN** BFF calls `GET /equipment` on `equipment-service` and maps the REST response to GraphQL schema

#### Scenario: BFF resolves query via mock (mock mode)
- **WHEN** BFF is running with mock resolvers enabled
- **THEN** BFF returns realistic fake data matching the same GraphQL schema shape as real mode

### Requirement: BFF returns standardized GraphQL errors
The BFF SHALL return errors with extensions containing `code`, `statusCode`, `details`, `timestamp`, and `traceId`.

#### Scenario: Microservice returns error
- **WHEN** a microservice returns an error (e.g., 409 CONFLICT)
- **THEN** BFF maps it to a GraphQL error with extensions: `{ code: "CONFLICT", statusCode: 409, details: [...], timestamp: "...", traceId: "..." }`

### Requirement: BFF supports pagination arguments
The BFF SHALL accept `page` and `pageSize` arguments on list queries and map them to REST query params for microservices.

#### Scenario: Paginated query
- **WHEN** frontend sends `equipments(page: 2, pageSize: 10)`
- **THEN** BFF calls microservice with `?page=2&pageSize=10` and returns paginated results

### Requirement: BFF maps clean enums to display labels
The BFF SHALL use clean enum values (no accents/spaces) in the GraphQL schema and map to display-friendly labels when needed via resolver logic.

#### Scenario: Equipment type enum
- **WHEN** frontend queries equipment type
- **THEN** BFF returns clean enum value like `CLIMATIZATION` (not `Climatização`)

### Requirement: BFF handles partial failures gracefully
The BFF SHALL return partial data when one microservice is unavailable, with errors in the GraphQL `errors` array for unresolvable fields.

#### Scenario: One microservice down
- **WHEN** `equipment-service` is unavailable but `maintenance-service` is up
- **THEN** BFF returns maintenance data normally and null for equipment fields with an error entry in `errors` array
