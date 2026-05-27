## ADDED Requirements

### Requirement: Dashboard Data Comes From BFF
The frontend Dashboard SHALL render operational counts, charts, recent equipment, upcoming maintenance, and condominium context from BFF GraphQL responses, not hardcoded runtime arrays or constants.

#### Scenario: Dashboard Loads Real Summary
- **WHEN** an authenticated user opens the Dashboard
- **THEN** the frontend executes a Dashboard GraphQL query against the configured BFF endpoint and renders the returned summary data

#### Scenario: Dashboard Has No Hardcoded Equipment Rows
- **WHEN** `src/app/components/DashboardPage.tsx` is inspected
- **THEN** it does not contain runtime demo arrays such as `maintenanceData`, `recentEquipment`, or `upcomingMaintenance`

#### Scenario: Dashboard Service Error
- **WHEN** the BFF cannot resolve required dashboard data from a real microservice
- **THEN** the frontend shows a loading or error state instead of substituting demo values

### Requirement: BFF Exposes Dashboard Summary
The BFF SHALL expose a typed Dashboard summary query that composes real data from configured microservice data sources.

#### Scenario: Dashboard Summary Query
- **WHEN** the frontend executes `dashboardSummary`
- **THEN** the BFF resolves the response through real equipment, maintenance, warranty, notification, condominium, and related service calls as needed

#### Scenario: Dashboard Summary Counts
- **WHEN** the BFF returns dashboard cards or navigation counts
- **THEN** each count is derived from service totals, filters, or real result sets and is not hardcoded in the BFF

#### Scenario: Dashboard Summary Partial Failure
- **WHEN** one downstream microservice fails while others are available
- **THEN** the BFF returns the resolvable portions with a standardized GraphQL error for the failed portion, or fails the whole query with a clear standardized error

### Requirement: Layout Uses Real User And Summary Data
The application shell SHALL use authenticated user, selected condominium, and BFF summary data for visible operational labels and badges.

#### Scenario: Condominium Label
- **WHEN** an authenticated user has a selected condominium
- **THEN** the sidebar condominium label is rendered from `me.condominiumName` or the selected condominium returned by the BFF

#### Scenario: Navigation Badges
- **WHEN** inventory or maintenance badges are displayed in the sidebar
- **THEN** their values come from BFF data and are omitted or shown as loading when data is unavailable

### Requirement: Social Login Does Not Use Admin Fallback
The frontend SHALL NOT satisfy social login by calling password login with local admin credentials.

#### Scenario: Social Provider Unsupported
- **WHEN** social OAuth is not configured and the user clicks Google or Microsoft login
- **THEN** the frontend shows an explicit unsupported-operation message and does not authenticate the user as admin

#### Scenario: Social Provider Configured
- **WHEN** social OAuth is configured and the user completes a provider flow
- **THEN** the frontend calls the BFF `socialLogin` mutation with provider authorization data and uses the returned authenticated user

### Requirement: Unsupported Frontend Modules Are Not Presented As Backed Features
The frontend SHALL NOT expose operational module pages that only render placeholder content when no BFF/backend contract exists for that module.

#### Scenario: Module Without Backend Contract
- **WHEN** a module such as locations, checklists, documents, qrcodes, or reports has no real BFF/backend support
- **THEN** the application hides the navigation entry or blocks access with an explicit unavailable state that does not display fake operational data

#### Scenario: Module With Backend Contract
- **WHEN** a previously unsupported module is exposed in navigation
- **THEN** the module loads its visible operational data through BFF GraphQL

### Requirement: Brigadier Notifications Are Delivered Through Backend Flow
The brigadier notification workflow SHALL use the BFF `notifyBrigadiers` mutation for system delivery and logging.

#### Scenario: Notify Brigadiers
- **WHEN** a user sends a brigadier notification from the frontend
- **THEN** the frontend calls `notifyBrigadiers` and displays the delivery/log result returned by the BFF

#### Scenario: No Frontend-Only Delivery Shortcut
- **WHEN** the notification workflow sends WhatsApp or SMS messages
- **THEN** delivery is not considered successful because the frontend opened `wa.me` or `sms:`; success comes only from backend/BFF notification logs

### Requirement: Runtime Mock Guard Blocks Known Demo Values
The runtime mock verification script SHALL detect remaining operational demo values and mock fallback patterns in runtime frontend and BFF source paths.

#### Scenario: Guard Detects Dashboard Demo Data
- **WHEN** runtime source contains demo operational values such as `EQ-001`, `maintenanceData`, `recentEquipment`, `upcomingMaintenance`, `Residencial Park` as a fixed UI label, or `2.4k+`
- **THEN** `npm run verify:runtime-mocks` fails with a clear finding

#### Scenario: Guard Detects Social Admin Fallback
- **WHEN** runtime source maps social login to `admin@equipmap.local` or another password-login fallback
- **THEN** `npm run verify:runtime-mocks` fails with a clear finding

#### Scenario: Guard Allows Fixtures
- **WHEN** seed data, tests, docs, or OpenSpec artifacts contain fixture values
- **THEN** the guard ignores them only through explicit path scoping or allowlist rules
