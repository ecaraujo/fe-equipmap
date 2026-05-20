## ADDED Requirements

### Requirement: Install and configure Apollo Client
The frontend SHALL install Apollo Client and configure it with the BFF GraphQL endpoint (`VITE_API_BASE_URL`), JWT auth link, and error handling.

#### Scenario: Apollo Client configured
- **WHEN** `VITE_API_BASE_URL` is set
- **THEN** Apollo Client connects to BFF with Authorization header containing JWT

#### Scenario: Fallback to mock mode
- **WHEN** `VITE_API_BASE_URL` is empty
- **THEN** frontend continues using local mock data (existing behavior preserved)

### Requirement: Configure graphql-codegen
The frontend SHALL use `@graphql-codegen/cli` to generate TypeScript types and Apollo hooks from the BFF's GraphQL schema.

#### Scenario: Types generated from schema
- **WHEN** developer runs codegen command
- **THEN** TypeScript types and typed hooks are generated matching the BFF schema exactly

#### Scenario: Schema change breaks codegen
- **WHEN** BFF schema changes and frontend runs codegen
- **THEN** generated types update; any breaking change causes TypeScript compilation errors

### Requirement: Migrate AuthContext to GraphQL mutations
The frontend SHALL replace the current auth service layer with Apollo Client mutations (`login`, `logout`, `refresh`, `switchCondominium`) and query (`me`).

#### Scenario: Login via GraphQL
- **WHEN** user submits login form
- **THEN** frontend calls `login` mutation via Apollo Client and stores access token

#### Scenario: Token refresh
- **WHEN** access token expires during a request
- **THEN** Apollo link automatically attempts refresh mutation before retrying

### Requirement: Implement condominium selection screen
The frontend SHALL display a condominium selection screen after login when user belongs to multiple condominiums.

#### Scenario: Multiple condominiums
- **WHEN** user logs in and `me` query returns multiple condominiums
- **THEN** selection screen is displayed; after selection, `switchCondominium` mutation is called

#### Scenario: Single condominium
- **WHEN** user logs in and belongs to one condominium
- **THEN** auto-selected, no selection screen shown

### Requirement: Migrate domain hooks to Apollo Client
The frontend SHALL replace custom hooks (`useEquipment`, `useMaintenance`, `useWarranty`, `useParking`, `useBrigadiers`) with generated Apollo hooks from codegen.

#### Scenario: useEquipment migrated
- **WHEN** InventoryPage renders
- **THEN** it uses codegen-generated `useEquipmentsQuery` hook instead of manual `useEquipment`

#### Scenario: Mutation with optimistic update
- **WHEN** user creates equipment
- **THEN** Apollo Client performs optimistic cache update for immediate UI feedback

### Requirement: Remove manual type definitions
The frontend SHALL remove manual type files in `src/types/` (auth.types.ts, equipment.types.ts, maintenance.types.ts, warranty.types.ts, parking.types.ts, brigadier.types.ts, notification.types.ts) after codegen types are in place.

#### Scenario: No manual types remain
- **WHEN** migration is complete
- **THEN** `src/types/` directory contains only `common.types.ts` (if shared utilities remain) or is removed entirely

### Requirement: Migrate NotificationContext to GraphQL
The frontend SHALL replace NotificationContext to consume notifications via GraphQL queries from the BFF.

#### Scenario: Notifications loaded
- **WHEN** user navigates to app
- **THEN** notifications are fetched via `notifications` GraphQL query and displayed in UI

### Requirement: Adapt ParkingLotteryPage for LotterySession
The frontend SHALL adapt the parking page to use the new `LotterySession` type (with seed, undrawnApartments) from the GraphQL schema.

#### Scenario: Display lottery results with session data
- **WHEN** lottery has been executed
- **THEN** page displays results grouped by session, showing seed and any undrawn apartments
