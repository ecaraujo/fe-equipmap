# EquipMap AI Implementation Learnings

## Purpose

Use this file as persistent project memory for AI coding agents. Read it before changing code. Apply these rules to avoid repeating mistakes already found while migrating EquipMap from mock runtime paths to the real BFF and microservices stack.

## How Future AI Agents Must Use This File

- Read this file before implementing, refactoring, fixing bugs, or generating tests.
- Treat these entries as project-specific constraints, not optional advice.
- When a task conflicts with this file, inspect the current code and update this file with the new decision.
- After fixing a non-trivial bug, discovering a recurring mistake, or changing an architecture decision, add a dated entry under "Log of New Lessons Learned".

## Architecture Lessons Learned

- Runtime mock mode is no longer supported. Do not reintroduce `apiConfig.useMock`, `MOCK_MODE`, `src/app/data/appData.ts`, BFF in-memory stores, faker-backed resolvers, or generic `Mock*Provider` runtime classes.
- Frontend runtime must use Apollo GraphQL through `VITE_API_BASE_URL`, normally `http://localhost:4000/graphql`.
- BFF runtime must call real service URLs configured by env vars: `AUTH_SERVICE_URL`, `CONDOMINIUM_SERVICE_URL`, `EQUIPMENT_SERVICE_URL`, `MAINTENANCE_SERVICE_URL`, `WARRANTY_SERVICE_URL`, `PARKING_SERVICE_URL`, `BRIGADIER_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`.
- `brigadier-service` may simulate external WhatsApp/SMS delivery only through `SandboxMessagingProvider`, enabled explicitly with `EQUIPMAP_MESSAGING_PROVIDER=sandbox`. Do not call it "mock" in runtime code.
- The dashboard is currently an exception: `src/app/components/DashboardPage.tsx` still contains static arrays/cards (`maintenanceData`, `recentEquipment`, `upcomingMaintenance`, counts like `248`). Do not assume Dashboard data comes from the database until it is migrated to real queries.
- Domain pages such as inventory, maintenance, warranty, parking, brigadiers, and notifications should go through hooks backed by generated Apollo operations in `src/graphql/generated.tsx`.
- Apartment/unit registration is a shared capability in the MVP. Keep it accessible inside `Sorteio de Vagas` and also expose it as a standalone `Apartamentos` module below `Garantias`; both entry points must reuse the same BFF contract, Apollo mutations, validation helpers, and form components so the capability can be modularized/commercialized separately later.

## Testing Lessons Learned

- Validate runtime mock removal with:
  ```powershell
  npm run verify:runtime-mocks
  ```
- `verify-runtime-mocks.mjs` intentionally scans runtime frontend/BFF paths (`src`, `bff-equipmap/src`, `bff-equipmap/schema.graphql`) and ignores docs, OpenSpec, tests, seeds, fixtures, and validation scripts. Do not broaden it to all files without handling seed/admin false positives.
- Validate frontend after auth/client changes with:
  ```powershell
  npm run build
  ```
- Validate BFF after resolver/context/config changes with:
  ```powershell
  cd bff-equipmap
  npm run build
  ```
- `bff-equipmap` contract tests use `tsx`, which may fail in the sandbox with esbuild `spawn EPERM`. Treat this as an execution-permission issue, not as a contract failure; rerun with appropriate permissions when available:
  ```powershell
  cd bff-equipmap
  npm run test:contract
  ```
- Validate integrated backend/BFF with:
  ```powershell
  cd equipmap-infra
  node scripts/check-health.mjs
  node scripts/run-homologation.mjs
  ```
- `run-homologation.mjs` includes RabbitMQ resilience and needs permission to stop/start Docker containers. If it fails only with "Could not stop RabbitMQ" or Docker pipe access errors, rerun it with elevated Docker permissions before treating the suite as failed.
- `validate-jobs-idempotency.mjs` must wait for async notification processing before comparing duplicate counts. Do not use a fixed short sleep as proof of no notification.
- Browser errors from extensions such as `A listener indicated an asynchronous response...` are usually not app failures. Prioritize GraphQL/network/runtime errors first.
- Every implemented OpenSpec task must include a SonarCloud/SonarQube review of touched files before marking the task complete. Fix new bugs, vulnerabilities, security hotspots, code smells, duplication, and maintainability debt introduced by the task; document any false positive with a concrete reason.

## Framework and Configuration Lessons Learned

- Vite only loads `.env.local` at dev server startup. After changing `.env.local`, restart Vite.
- Root `.env.local` must include:
  ```env
  VITE_API_BASE_URL=http://localhost:4000/graphql
  ```
- If the frontend shows a blank screen with `VITE_API_BASE_URL is required`, the Vite process was started without a valid env file or before `.env.local` was created.
- Radix `asChild` components pass refs into children. Shared UI components used as Radix children must use `React.forwardRef`. `src/app/components/ui/button.tsx` already does this.
- Apollo auth link must not send stale `Authorization` headers for public operations: `Login`, `SocialLogin`, and `Refresh`.
- `AuthContext` must not run `me` without a stored token. `useMeQuery` must stay skipped when no token exists.
- Clear stale browser auth when debugging login:
  ```js
  localStorage.removeItem("equipmap_auth_token")
  ```

## Build and Dependency Issues

- `npm run build` may fail in sandbox with esbuild `spawn EPERM`; rerun with elevated permissions when needed.
- Java services use local Gradle under `.tools/gradle-8.13/bin/gradle.bat` more reliably than a missing global `gradle`.
- Before rebuilding Java service containers, ensure fresh jars exist in each service `build/libs`. Dockerfiles copy existing jars; they do not run Gradle inside the image.
- Gradle wrapper/cache can fail on Windows with zip/cache/temp errors. Prefer isolated dirs when running Gradle:
  ```powershell
  New-Item -ItemType Directory -Force -Path '.gradle-home','.tmp' | Out-Null
  $env:GRADLE_USER_HOME = (Resolve-Path '.gradle-home')
  $env:JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=' + (Resolve-Path '.tmp')
  ```
- If `gradle` is not recognized, use:
  ```powershell
  ..\.tools\gradle-8.13\bin\gradle.bat --no-daemon bootJar
  ```

## Integration and API Contract Lessons Learned

- To start backend and BFF when frontend Vite is already running:
  ```powershell
  npm run start:local -- --NoFrontend
  ```
- To start everything through Docker Compose:
  ```powershell
  npm run start:local
  ```
- If the browser shows `ERR_CONNECTION_REFUSED` for `http://localhost:4000/graphql`, the BFF is not running. Check:
  ```powershell
  cd equipmap-infra
  docker compose --env-file .env -f docker-compose.yml ps
  Invoke-WebRequest -Uri http://localhost:4000/health -UseBasicParsing
  ```
- If editing BFF source while Docker is running, rebuild/recreate the BFF container. The running container uses `dist/src/index.js`, not live TypeScript source.
- `graphql-codegen` must not generate duplicate base types into `src/graphql/generated.tsx`. Do not combine plugins in a way that redeclares enums/types such as `AppNotificationType`.
- Treat generated GraphQL enums as string literal unions. Use string keys like `"ADMIN"`, `"ACTIVE"`, `"MAINTENANCE_OVERDUE"` in mappers/inputs, not runtime enum property access that may not exist.
- BFF public operations must ignore stale bearer tokens in context creation. Login must work even when the browser has an expired token.

## Naming and Code Organization Conventions

- Use explicit sandbox naming for local-only simulations: `SandboxMessagingProvider`, not `MockMessagingProvider`.
- Keep frontend GraphQL mapping in `src/graphql/inputs.ts`, `src/graphql/mappers.ts`, and `src/graphql/models.ts`.
- Keep generated GraphQL output in `src/graphql/generated.tsx`; do not manually edit generated code unless diagnosing a generator issue.
- Keep BFF real service integration in `bff-equipmap/src/data-sources.ts` and resolver orchestration in `bff-equipmap/src/resolvers.ts`.
- Keep infra validation scripts in `equipmap-infra/scripts`.

## Known Anti-Patterns To Avoid

- Do not add fallback mock data when a backend call fails. Surface a clear error or implement the real operation.
- Do not add `MOCK_MODE`, `useMock`, or generic `Mock*Provider` in runtime paths.
- Do not satisfy frontend mutations by only changing local React state.
- Do not let public auth operations carry stale bearer tokens.
- Do not make BFF required service URLs optional.
- Do not assume `docker compose up --build` rebuilds Java jars; build jars first.
- Do not use Dashboard as proof that backend data is wired; it is currently static.
- Do not edit files outside the requested scope to "clean up" unrelated dirty worktree changes.

## Checklist Before Implementing Changes

- Read this file and `AGENTS.md`.
- Identify whether the touched UI is static or GraphQL-backed.
- Check the relevant OpenSpec change/tasks if the request references OpenSpec.
- Search before changing:
  ```powershell
  rg -n "useMock|MOCK_MODE|Mock\\w*Provider|appData|faker" .
  ```
- For frontend changes, run `npm run build`.
- For BFF changes, run `cd bff-equipmap; npm run build`.
- For runtime mock cleanup, run `npm run verify:runtime-mocks`.
- For integrated behavior, run `cd equipmap-infra; node scripts/check-health.mjs`.
- If auth/login is touched, test with a stale token and then with a cleared token.
- If Docker behavior is touched, check `docker compose --env-file .env -f docker-compose.yml config`.
- Before marking an OpenSpec task complete, inspect SonarCloud/SonarQube findings for the files changed in that task and leave no new unresolved issues.

## Log of New Lessons Learned

- 2026-05-25: `VITE_API_BASE_URL` is mandatory. Missing root `.env.local` causes a blank screen at Vite startup.
- 2026-05-25: `Button` must use `React.forwardRef` because Radix `DropdownMenuTrigger asChild` injects refs.
- 2026-05-25: Apollo must not send stale tokens to `Login`, `SocialLogin`, or `Refresh`; BFF must ignore stale bearer tokens for public operations.
- 2026-05-25: `me` must not run without a token, otherwise error handling may attempt invalid refresh flows.
- 2026-05-25: Dashboard data is still static. Inventory and other domain pages are GraphQL-backed, but Dashboard must be migrated separately.
- 2026-05-25: `MockMessagingProvider` was replaced by explicit `SandboxMessagingProvider` gated by `EQUIPMAP_MESSAGING_PROVIDER=sandbox`.
- 2026-05-25: `graphql-codegen` duplicate type generation can break Vite/Babel with `Identifier 'AppNotificationType' has already been declared`.
- 2026-05-25: `validate-jobs-idempotency.mjs` needs polling for async notification delivery before asserting idempotency.
- 2026-05-25: `dashboardSummary` belongs in the BFF and must compose real service calls. Do not compute Dashboard totals from frontend constants or from paginated frontend-only state.
- 2026-05-25: BFF `tsx` contract tests can fail under sandbox restrictions with esbuild `spawn EPERM`; rerun `cd bff-equipmap; npm run test:contract` with execution permissions when available.
- 2026-05-26: Social login must remain explicitly unsupported until a real OAuth authorization flow exists. In `src/contexts/AuthContext.tsx`, do not call password login or BFF `socialLogin` without provider authorization data; show an explicit unavailable message in `src/app/components/LoginPage.tsx`.
- 2026-05-26: Frontend modules without BFF/backend contracts must stay hidden from `src/app/components/Layout.tsx` and absent from `src/app/App.tsx` route state. Do not reintroduce generic `PlaceholderPage` entries for `locations`, `checklists`, `documents`, `qrcodes`, or `reports`.
- 2026-05-26: Brigadier message templates in `src/app/components/BrigadiersPage.tsx` are UI presets only and must stay generic. System delivery success must come from the BFF `notifyBrigadiers` mutation and returned `NotificationLog`; do not use `window.open("https://wa.me/...")` or `sms:` as delivery behavior.
- 2026-05-26: Runtime mock guard patterns must distinguish runtime regressions from legitimate contracts. `recentEquipment`/`upcomingMaintenances` are valid GraphQL fields; block demo arrays like `const recentEquipment`. `sms: "SMS"` is a valid channel map; block URL/protocol usage like `"sms:` or `window.open(...)`.
- 2026-05-26: Integrated homologation may need elevated Docker access because RabbitMQ resilience intentionally stops and restarts `equipmap-rabbitmq-1`. A non-elevated Docker pipe denial is an environment permission issue; rerun `cd equipmap-infra; node scripts/run-homologation.mjs` with Docker permissions.
- 2026-05-26: Radix `DialogOverlay`/`DialogContent` must also use `React.forwardRef`, not only buttons used with `asChild`; otherwise opening parking dialogs logs `Function components cannot be given refs`.
- 2026-05-26: `parking-service` apartment responses currently expose only `unit`, `block`, `owner`, and `hasVehicle`. Do not mark BFF `Apartment.phone`, `Apartment.email`, or `Apartment.floor` as required until the microservice persists and returns them; nullable fields prevent `Cannot return null for non-nullable field Apartment.phone`.
- 2026-05-26: Parking lottery execution is stateful. If existing lottery results are present, the UI must block another `executeLottery` call and ask the user to reset first; repeated calls can return `Parking operation conflicts with existing data or concurrent execution`.
- 2026-05-26: Maintenance `cost` is nullable in the real backend/BFF contract. UI code must check `typeof cost === "number"` before calling `toLocaleString`; `cost !== undefined` is not enough because GraphQL returns `null`.
- 2026-05-26: `maintenance-service` `CompleteMaintenanceRequest.completedDate` is a Java `LocalDate`; frontend/BFF calls must send `yyyy-MM-dd`, not `pt-BR` strings from `toLocaleDateString("pt-BR")`, or completion can fail with a generic GraphQL `Unexpected error`.
- 2026-05-26: When a BFF mutation exists, add the corresponding frontend GraphQL operation and hook before marking the UI feature complete. `deleteMaintenance` existed in the BFF schema but was unusable until `DeleteMaintenance` was added to `src/graphql/operations.graphql` and codegen regenerated `useDeleteMaintenanceMutation`.
- 2026-05-26: Sidebar badges come from `DashboardSummary`, not from the currently open page query. Mutations that change dashboard counters, such as maintenance create/complete/delete, must refetch `DashboardSummaryDocument` or update the Apollo cache; page-level `refetch()` alone leaves Layout badges stale.
- 2026-05-26: Inventory detail actions must not be left as inert buttons. If `bff-equipmap/schema.graphql` exposes a mutation such as `updateEquipment`, add the operation to `src/graphql/operations.graphql`, regenerate `src/graphql/generated.tsx`, wire the hook in `src/hooks/useEquipment.ts`, and refetch `DashboardSummaryDocument` for count-sensitive mutations.
- 2026-05-26: Equipment maintenance scheduling from inventory must call the real `createMaintenance` mutation with `equipmentId`; do not create local React-only records. Date inputs must be normalized to `yyyy-MM-dd` before sending them through GraphQL input mappers.
- 2026-05-26: Equipment QR Code is a print-only frontend artifact generated from the real equipment object already returned by the BFF. It may encode all current equipment fields for printing, but must not persist QR state locally or invent data outside the BFF response.
- 2026-05-26: Do not hand-roll QR Code encoding. Use the `qrcode` package with margin and sufficient rendered width; custom QR matrices can look valid but fail on mobile scanners. Keep the payload compact when it must include all equipment fields.
- 2026-05-26: Frontend input mappers must not silently emit `undefined` for invalid localized enum values. Use strict mapping helpers in `src/graphql/inputs.ts` so values like equipment status fail visibly instead of omitting fields from mutations.
- 2026-05-26: Java services use `LocalDate` for equipment and maintenance date fields even when the BFF GraphQL scalar is named `DateTime`. Send `yyyy-MM-dd` from frontend input mappers and format API strings matching `yyyy-MM-dd` directly in `src/graphql/mappers.ts`; do not pass date-only values through `new Date(...).toLocaleDateString()` because timezone conversion can subtract one day.
- 2026-05-26: `warranty-service` requires `purchaseDate`, `warrantyStart`, `warrantyEnd`, and `warrantyMonths >= 1` on create. Warranty forms must collect or derive these fields and `src/graphql/inputs.ts` must send ISO `yyyy-MM-dd`; do not use `toLocaleDateString("pt-BR")` in date input handlers.
- 2026-05-26: Warranty "expiring" means within 30 days. Keep `WARRANTY_EXPIRING_WINDOW_DAYS`, `equipmap.warranty.expiring-window-days`, BFF `dashboardSummary.warrantyExpiringTotal`, and the sidebar `Garantias` badge aligned to the 30-day window.
- 2026-05-26: BFF resolvers should normalize create payloads when the public GraphQL schema is looser than the Java service contract. For `createWarranty`, fill `purchaseDate` from `warrantyStart` and calculate `warrantyMonths` before calling `warranty-service` so clients do not trigger opaque backend validation errors.
- 2026-05-27: Brigadier create/update forms must send every required BFF field, especially `block`. Initialize `src/app/components/BrigadiersPage.tsx` with `block: "A"`, mark it required, and validate before calling `createBrigadier`; otherwise GraphQL rejects the request with `Field "block" of required type "String!" was not provided`.
- 2026-05-27: Keep `<input type="date">` state as ISO `yyyy-MM-dd`. Do not store `toLocaleDateString("pt-BR")` in form state; reconverting localized strings can produce invalid values such as `2-05-27`. `src/graphql/inputs.ts` must accept both ISO dates and one/two-digit `pt-BR` dates defensively.
- 2026-05-27: Every Radix `DialogContent` in runtime pages must include `DialogDescription` or explicitly set `aria-describedby={undefined}`. Prefer a real `DialogDescription` so the console does not warn while users test forms.
- 2026-06-04: Shared apartment CRUD is consumed via two independent hooks: `useApartments` (standalone page) refetches both `ApartmentsDocument` and `ParkingDataDocument`; `useParking` (lottery context) refetches `ParkingDataDocument` via its own `refetch()`. Both paths keep Apollo cache consistent across views without manual cache writes.
- 2026-06-04: Adding a new page requires updating the `Page` string literal union in both `src/app/App.tsx` and `src/app/components/Layout.tsx`, plus adding the switch case and nav item. The two files share the same type definition independently (no single shared type export).
- 2026-05-27: `brigadier-service` notification log responses do not currently include `updatedAt`. Keep the BFF `NotificationLog.updatedAt` resolver defensive with `updatedAt ?? sentAt ?? createdAt`; otherwise GraphQL fails with `Cannot return null for non-nullable field NotificationLog.updatedAt`.
- 2026-05-27: Phone fields in forms must use the visible mask `(xx)xxxxx-xxxx`, but GraphQL input mappers should strip to digits before calling services. Use `src/utils/format.ts` helpers (`formatPhone`, `onlyDigits`) instead of ad hoc phone formatting.
- 2026-05-27: Brigadier `apartment` and `block` must be persisted by the real `brigadier-service`, not synthesized in BFF resolvers. Keep `CreateBrigadierRequest`, `UpdateBrigadierRequest`, `BrigadierResponse`, `Brigadier`, Flyway migrations, and `bff-equipmap/src/resolvers.ts::brigadierBody` aligned when adding GraphQL fields.
- 2026-05-27: Never spread Apollo query objects or UI models into mutation variables. Generated objects include fields such as `__typename`, `id`, labels, status, audit timestamps, and `createdBy` that are rejected by input types like `UpdateBrigadierInput`. Keep edit forms as allowlisted DTO fields and make `src/graphql/inputs.ts` return explicit mutation input objects only.
- 2026-05-27: Cross-page action buttons must call the same real mutation flow as the domain page. For example, Dashboard "Novo equipamento" must open an equipment form backed by `useEquipment().create`, not an inert button or local-only modal, and must refetch `DashboardSummary` after saving.
- 2026-05-27: ESLint/Sonar treat destructured discard variables as unused even when prefixed with `_`. In BFF resolvers, prefer explicit allowlist/filter helpers such as `parkingApartmentBody` over `const { phone: _phone, ...rest } = input` when adapting GraphQL inputs to narrower service payloads.
- 2026-05-27: SonarJS/SonarTS findings in `equipmap-infra/scripts/*.mjs` should be fixed without changing validation semantics: use `node:` imports for built-ins, avoid default parameters before required ones, handle caught exceptions explicitly, extract nested template literals, and replace nested ternaries with small helper functions.
- 2026-05-27: SonarJava does not always infer JPA derived query usage or persisted audit fields. Remove truly unused imports, and expose intentional persisted fields such as soft-delete timestamps or outbox publication timestamps through getters instead of deleting domain state used by Spring Data/JPA.
- 2026-05-27: Apartment/unit registration must be treated as a reusable domain capability, not a UI feature owned only by `ParkingLotteryPage`. Keep the registration flow available inside `Sorteio de Vagas`, add a standalone `Apartamentos` menu entry below `Garantias`, and share form/payload/mutation logic between both entry points to support future post-MVP modularization and separate commercialization.
- 2026-05-27: SonarCloud/SonarQube is a required quality gate for every implemented OpenSpec task. Do not mark a task complete while new findings remain in touched files; fix code smells and maintainability issues alongside functional bugs instead of deferring them to chat history.
