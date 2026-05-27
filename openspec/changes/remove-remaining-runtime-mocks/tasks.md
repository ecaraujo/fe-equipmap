## 1. BFF Dashboard Contract

- [x] 1.1 Add Dashboard summary GraphQL types and `dashboardSummary` query to `bff-equipmap/schema.graphql`.
- [x] 1.2 Add or extend BFF data-source methods needed to read real equipment, maintenance, warranty, notification, condominium, and related service data for Dashboard summaries.
- [x] 1.3 Implement the `dashboardSummary` resolver in `bff-equipmap/src/resolvers.ts`, deriving all counts, chart buckets, recent equipment, and upcoming maintenance from real service responses.
- [x] 1.4 Ensure the Dashboard resolver handles downstream service failures with existing standardized BFF error behavior and does not return fallback demo data.

## 2. Frontend GraphQL And Codegen

- [x] 2.1 Add a `DashboardSummary` operation to `src/graphql/operations.graphql` using the new BFF schema fields.
- [x] 2.2 Regenerate GraphQL types/hooks into `src/graphql/generated.tsx` without duplicate base type declarations.
- [x] 2.3 Add or update frontend model/mapper helpers only if needed to keep Dashboard rendering code simple and typed.

## 3. Dashboard Runtime Data Migration

- [x] 3.1 Replace `maintenanceData`, `recentEquipment`, and `upcomingMaintenance` in `src/app/components/DashboardPage.tsx` with the generated Dashboard Apollo hook.
- [x] 3.2 Replace hardcoded Dashboard cards and condominium header values with fields returned by `dashboardSummary`.
- [x] 3.3 Add loading, empty, and error states for Dashboard data without substituting demo values.
- [x] 3.4 Verify Dashboard recent equipment and upcoming maintenance reflect backend data changes rather than static rows such as `EQ-001`.

## 4. Layout Real Data Migration

- [x] 4.1 Replace the fixed sidebar condominium label in `src/app/components/Layout.tsx` with authenticated user or selected condominium data from the BFF.
- [x] 4.2 Replace static navigation badges such as inventory `248` and maintenance `18` with BFF-backed values or omit badges while loading/unavailable.
- [x] 4.3 Ensure Layout still works before Dashboard data is loaded and does not render hardcoded operational fallbacks.

## 5. Authentication Mock Removal

- [x] 5.1 Remove the `loginWithSocial` admin credential fallback from `src/contexts/AuthContext.tsx`.
- [x] 5.2 Either wire `loginWithSocial` to the BFF `socialLogin` mutation with real provider authorization data or return an explicit unsupported-operation error.
- [x] 5.3 Update `src/app/components/LoginPage.tsx` so Google/Microsoft buttons do not imply successful social authentication when social OAuth is unavailable.
- [x] 5.4 Remove or externalize login-page operational marketing counts if they are treated as runtime business information.

## 6. Unsupported Module Exposure

- [x] 6.1 Remove or hide navigation entries for `locations`, `checklists`, `documents`, `qrcodes`, and `reports` until they have real BFF/backend contracts.
- [x] 6.2 Remove the generic reachable `PlaceholderPage` flow from `src/app/App.tsx` or replace it with an explicit unavailable state that cannot be confused with backed operational data.
- [x] 6.3 Confirm unsupported module routes cannot display fake business content during integrated runtime.

## 7. Brigadier Notification Flow

- [x] 7.1 Review `src/app/components/BrigadiersPage.tsx` message templates and classify them as UI presets or backend-managed operational content.
- [x] 7.2 If templates are operational content, move them behind a BFF/backend contract; otherwise document them as UI presets in code or implementation learnings.
- [x] 7.3 Remove frontend-only notification delivery success behavior based on `window.open("https://wa.me/...")` or `sms:` from the system send flow.
- [x] 7.4 Ensure successful brigadier notification feedback is based on the BFF `notifyBrigadiers` result and notification logs.

## 8. Guardrails And Documentation

- [x] 8.1 Extend `equipmap-infra/scripts/verify-runtime-mocks.mjs` to fail on Dashboard demo arrays, known demo strings, hardcoded runtime badges, and social admin fallback patterns.
- [x] 8.2 Scope guard allowlists so seed data, tests, docs, and OpenSpec artifacts can contain fixture examples without masking runtime violations.
- [x] 8.3 Update `docs/ai/implementation-learnings.md` with any new concrete lessons discovered while implementing this change.

## 9. Verification

- [x] 9.1 Run `npm run verify:runtime-mocks` and fix any remaining runtime mock findings.
- [x] 9.2 Run frontend build with `npm run build`.
- [x] 9.3 Run BFF build with `cd bff-equipmap; npm run build`.
- [x] 9.4 If Docker services are available, run integrated health/homologation checks from `equipmap-infra`.
