## 1. Parking Service Data Model

- [x] 1.1 Add Flyway migration for apartment owner/tenant fields, rental dates, floor, observations, audit compatibility, active uniqueness, and existing `owner` data preservation; run Sonar review for touched SQL/config files.
- [x] 1.2 Expand `Apartment` entity with owner, tenant, contact, rental, floor, observations, soft-delete, and update methods while preserving lottery fields; run Sonar review for touched Java files.
- [x] 1.3 Update `CreateApartmentRequest`, `UpdateApartmentRequest`, and `ApartmentResponse` DTOs with the complete contract and validation annotations; run Sonar review for touched Java files.
- [x] 1.4 Update `ApartmentRepository` and `ParkingService` validation for uniqueness, rented tenant requirements, phone/date rules, RBAC, and soft-delete behavior; run Sonar review for touched Java files.
- [x] 1.5 Update `ParkingController` OpenAPI metadata and request/response handling for the expanded apartment contract; run Sonar review for touched Java files.
- [x] 1.6 Add or update `parking-service` tests for create/update/list/delete apartments, duplicate active units, rented validation, cross-condominium isolation, and lottery compatibility; run Sonar review for touched test files.

## 2. BFF GraphQL Contract

- [x] 2.1 Expand `bff-equipmap/schema.graphql` `Apartment`, `CreateApartmentInput`, and `UpdateApartmentInput` with owner/tenant/contact/rental fields while keeping parking compatibility; run Sonar review for touched schema/resolver files.
- [x] 2.2 Update `bff-equipmap/src/resolvers.ts` apartment mapping so persisted fields are not discarded and `owner`/`ownerName` compatibility remains defensive during migration; run Sonar review for touched TypeScript files.
- [x] 2.3 Add semantic apartment aliases if needed (`apartments`, `createApartment`, `updateApartment`, `deleteApartment`) without breaking existing `parkingApartments` operations; run Sonar review for touched TypeScript/schema files.
- [x] 2.4 Update or add BFF contract tests for apartment query/mutation payload roundtrip, validation errors, and compatibility with `parkingApartments`; run Sonar review for touched test files.

## 3. Frontend GraphQL Layer

- [x] 3.1 Update `src/graphql/operations.graphql` with the complete apartment fields for list/create/update mutations and run `npm run codegen`; run Sonar review for touched GraphQL/generated files.
- [x] 3.2 Update `src/graphql/models.ts` apartment DTOs with owner, tenant, rental, contact, and observation fields; run Sonar review for touched TypeScript files.
- [x] 3.3 Update `src/graphql/inputs.ts` with explicit allowlisted create/update apartment payloads, phone digit normalization, ISO date normalization, and no spreading of Apollo query objects; run Sonar review for touched TypeScript files.
- [x] 3.4 Update `src/graphql/mappers.ts` to format phone/date fields defensively and preserve nullable backend values; run Sonar review for touched TypeScript files.
- [x] 3.5 Create or refactor a shared apartment hook so apartment CRUD can be consumed independently from full parking lottery data; run Sonar review for touched hook files.

## 4. Shared Apartment UI

- [x] 4.1 Extract apartment form component from `ParkingLotteryPage` into a shared component with owner, tenant, rental, vehicle, and observation fields; run Sonar review for touched React files.
- [x] 4.2 Extract apartment list/table component that can render standalone apartment management and parking-lottery apartment selection states; run Sonar review for touched React files.
- [x] 4.3 Implement frontend validation for required owner contact, required tenant data when rented, phone mask `(xx)xxxxx-xxxx`, and ISO date payload conversion; run Sonar review for touched React/utility files.
- [x] 4.4 Ensure shared apartment dialogs include Radix `DialogDescription` or explicit accessibility handling and do not emit ref/aria console warnings; run Sonar review for touched React files.

## 5. Standalone Apartments Module

- [x] 5.1 Add `apartments` page state and route rendering in `src/app/App.tsx`; run Sonar review for touched React files.
- [x] 5.2 Add `Apartamentos` navigation item below `Garantias` in `src/app/components/Layout.tsx` without mock badge values; run Sonar review for touched React files.
- [x] 5.3 Implement `ApartmentsPage` using the shared apartment hook/components, real Apollo data, loading/error/empty states, search/filter, create/edit/delete actions, and no runtime mocks; run Sonar review for touched React files.
- [x] 5.4 Refetch or update Apollo cache after apartment mutations so both standalone and parking views stay consistent; run Sonar review for touched React/hook files.

## 6. Parking Lottery Integration

- [x] 6.1 Refactor `ParkingLotteryPage` to use the shared apartment components for its apartment tab while preserving spots, lottery execution, reset, and result behavior; run Sonar review for touched React files.
- [x] 6.2 Verify apartments with `hasVehicle = false` remain visible in apartment management and excluded from eligible lottery participants; run Sonar review for touched React/service files.
- [x] 6.3 Verify deleting an apartment uses backend soft delete and preserves previous lottery snapshots; run Sonar review for touched React/service files.

## 7. Verification, Quality Gate, And Documentation

- [x] 7.1 Run `parking-service` unit/integration tests relevant to apartment CRUD and lottery compatibility; record results and Sonar review evidence.
- [x] 7.2 Run `cd bff-equipmap; npm run build` and BFF contract tests when available; record results and Sonar review evidence.
- [x] 7.3 Run frontend `npm run build`, `npm run verify:runtime-mocks`, and codegen verification; record results and Sonar review evidence.
- [x] 7.4 Run integrated health/homologation checks where environment permits (`cd equipmap-infra; node scripts/check-health.mjs` and relevant smoke/homologation scripts); record skipped checks with reason if blocked.
- [x] 7.5 Update `docs/ai/implementation-learnings.md` with any new non-trivial bug, recurring mistake, architectural decision, Sonar pattern, or implementation constraint discovered during this change.
- [x] 7.6 Review all changed files in SonarCloud/SonarQube and ensure no new unresolved bugs, vulnerabilities, security hotspots, code smells, duplication, or maintainability debt remain before archiving the change.
