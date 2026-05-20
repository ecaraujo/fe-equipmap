## ADDED Requirements

### Requirement: User authenticates with email and password
The auth-service SHALL accept `POST /auth/login` with `{ email, password }` and return `AuthResponse { user, token }` with refresh token set as httpOnly cookie.

#### Scenario: Successful login
- **WHEN** user submits valid email and password
- **THEN** auth-service returns user profile + JWT access token (15min expiry) with claims `userId`, `role`, `condominiumId`; refresh token (7-day expiry) set in httpOnly Secure SameSite=Strict cookie

#### Scenario: Invalid credentials
- **WHEN** user submits incorrect email or password
- **THEN** auth-service returns 401 without revealing which field is incorrect

### Requirement: Access token contains condominium claim
The JWT access token SHALL contain claims `userId`, `role`, and `condominiumId` signed by the server.

#### Scenario: Token claims validated
- **WHEN** BFF receives a request with a valid JWT
- **THEN** BFF extracts `condominiumId` from claims and uses it for tenant isolation in downstream calls

### Requirement: Refresh token with httpOnly cookie and rotation
The auth-service SHALL store refresh tokens in httpOnly cookies and rotate them on every use. Reuse of a rotated token SHALL revoke the entire token family.

#### Scenario: Successful token refresh
- **WHEN** client sends `POST /auth/refresh` with valid refresh token cookie
- **THEN** auth-service issues new access token + new refresh token (old one invalidated)

#### Scenario: Rotated token reuse detected
- **WHEN** a previously rotated refresh token is reused
- **THEN** auth-service revokes ALL tokens in that family and returns 401

#### Scenario: Expired refresh token
- **WHEN** refresh token has expired (>7 days)
- **THEN** auth-service returns 401 requiring new login

### Requirement: Social login via OAuth 2.0
The auth-service SHALL support `POST /auth/social/google` and `POST /auth/social/microsoft` using OAuth 2.0 Authorization Code Flow.

#### Scenario: Successful Google login
- **WHEN** user completes Google OAuth flow and auth-service receives authorization code
- **THEN** auth-service exchanges code for user info, creates/links account, and returns AuthResponse

#### Scenario: OAuth provider failure
- **WHEN** Google/Microsoft OAuth endpoint is unavailable
- **THEN** auth-service returns controlled error without creating partial user

### Requirement: RBAC with three roles
The auth-service SHALL enforce role-based access control with `admin`, `manager`, and `viewer` roles per condominium.

#### Scenario: Viewer attempts write operation
- **WHEN** user with `viewer` role attempts POST/PUT/PATCH/DELETE
- **THEN** service returns 403 Forbidden

#### Scenario: Admin has full access across all condominiums
- **WHEN** user has `admin` role associated to all condominiums
- **THEN** user can access and modify data in any condominium

### Requirement: Switch condominium
The auth-service SHALL expose `POST /auth/switch-condominium` to change the active condominium and issue a new token pair.

#### Scenario: Valid switch
- **WHEN** authenticated user requests switch to a condominium they belong to
- **THEN** auth-service issues new JWT with updated `condominiumId` claim

#### Scenario: Invalid switch
- **WHEN** user requests switch to a condominium they don't belong to
- **THEN** auth-service returns 403

### Requirement: Post-login condominium selection
The system SHALL present a condominium selection screen after login if the user belongs to multiple condominiums. If only one, auto-select it.

#### Scenario: User with multiple condominiums
- **WHEN** user logs in and belongs to 3 condominiums
- **THEN** system presents selection screen; after selection, JWT is issued with chosen `condominiumId`

#### Scenario: User with single condominium
- **WHEN** user logs in and belongs to 1 condominium
- **THEN** system auto-selects it and issues JWT with that `condominiumId`

### Requirement: Cross-tenant access prevention
The auth-service SHALL reject any attempt to access data from a condominium different from the JWT's `condominiumId` claim and log the attempt.

#### Scenario: Cross-tenant access attempt
- **WHEN** user with `condominiumId=A` in JWT tries to access data of condominium B
- **THEN** service returns 403 and logs the attempt for audit

### Requirement: Password hashing with Bcrypt
The auth-service SHALL hash passwords using BCrypt with cost factor 12+.

#### Scenario: Password stored securely
- **WHEN** a new user is created with a password
- **THEN** password is stored as BCrypt hash with cost ≥ 12

### Requirement: Seed data bootstrap
The auth-service SHALL include a Flyway migration that creates 1 admin user and associates it with the seed condominium.

#### Scenario: Fresh database startup
- **WHEN** auth-service starts with empty database
- **THEN** Flyway migration creates admin user (configurable email/password via env vars) associated with seed condominium
