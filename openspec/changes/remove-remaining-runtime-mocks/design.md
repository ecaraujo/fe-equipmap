## Context

The previous `remove-runtime-mocks` change removed the broad mock mode from frontend, BFF, and services. The remaining issue is narrower: some frontend screens still display operational information from hardcoded values even while the integrated stack is running against the BFF.

Current known sources:
- `src/app/components/DashboardPage.tsx` owns static `maintenanceData`, `recentEquipment`, `upcomingMaintenance`, card counts, and the fixed condominium label `Residencial Park`.
- `src/app/components/Layout.tsx` owns static navigation badges and a fixed condominium selector label.
- `src/contexts/AuthContext.tsx` maps social login buttons to the local admin credentials.
- `src/app/App.tsx` exposes placeholder pages for features without BFF/backend support.
- `src/app/components/BrigadiersPage.tsx` has static message templates and frontend-only WhatsApp/SMS `window.open` behavior.

The architecture target remains: frontend reads/writes through Apollo GraphQL, BFF orchestrates real microservices, and unsupported features are explicit instead of simulated.

## Goals / Non-Goals

**Goals:**
- Source all visible operational Dashboard and Layout values from BFF GraphQL.
- Add a BFF Dashboard contract that composes real microservice data.
- Remove the social-login admin fallback.
- Prevent placeholder feature pages from being presented as working backend-backed modules.
- Ensure brigadier notification delivery goes through backend/BFF flows rather than frontend-only delivery behavior.
- Expand runtime mock verification so known demo values cannot silently return.

**Non-Goals:**
- Do not reintroduce `MOCK_MODE`, `useMock`, local `appData`, faker resolvers, or in-memory BFF stores.
- Do not build full implementations for unrelated modules unless needed to remove placeholder exposure.
- Do not add frontend-only local persistence as a substitute for backend support.
- Do not manually edit `src/graphql/generated.tsx`; regenerate it from schema and operations.

## Decisions

### Dashboard summary belongs in the BFF

Add a GraphQL query such as `dashboardSummary` instead of letting the frontend stitch several pages of operational data. The BFF is the correct orchestration layer and can centralize pagination, date windows, and partial failure mapping.

Alternatives considered:
- Frontend computes the dashboard from existing queries: rejected as the primary approach because totals can be wrong under pagination and every screen would duplicate aggregation rules.
- Add one summary endpoint to each microservice first: useful later for performance, but not required for the first implementation if the BFF can call existing real APIs safely.

### Dashboard contract returns presentation-ready domain summaries, not fake labels

The BFF should return typed summary values: totals, pending/overdue counts, warranty expiring counts, monthly maintenance buckets, recent equipment, and upcoming maintenance. Frontend may format dates and labels, but values must originate from BFF responses.

### Layout consumes authenticated context and summary counts

The condominium label should come from `me.condominiumName` or selected condominium data. Inventory and maintenance badges should come from dashboard summary or real paginated totals, not constants in `navItems`.

### Social login must be real or unsupported

The current `loginWithSocial` behavior is a runtime mock because Google/Microsoft buttons authenticate as `admin@equipmap.local`. If real OAuth is not implemented, the UI must return an explicit unsupported error and avoid calling `login` with local credentials.

### Placeholder modules must not look active

For `locations`, `checklists`, `documents`, `qrcodes`, and `reports`, either remove/hide the menu entries until backend support exists or implement real GraphQL contracts. A generic "in development" placeholder should not remain reachable from production-like integrated runtime.

### Brigadier delivery is backend-owned

The frontend may collect message text and selected recipients, but delivery and logging must use `notifyBrigadiers`. Direct `window.open("https://wa.me/...")` or `sms:` behavior is acceptable only if treated as explicit user contact links, not as the system notification delivery flow.

### Verification must block known operational demo values

`equipmap-infra/scripts/verify-runtime-mocks.mjs` should scan runtime source paths for forbidden patterns while allowing docs, tests, seed data, and OpenSpec artifacts where appropriate.

## Risks / Trade-offs

- BFF aggregation may require multiple microservice calls per dashboard render -> start with small page sizes and existing filters, then add service-level summary endpoints if performance is inadequate.
- Some counts may not be available without new filters -> implement BFF fallback only from real service responses, and document any unsupported count explicitly rather than inventing values.
- Hiding placeholder pages reduces visible navigation scope -> safer than showing non-backed modules as if complete.
- Real social OAuth may need provider credentials and redirect configuration -> if unavailable, ship explicit unsupported UX first.
- Verification guard can produce false positives on docs or seed fixtures -> scope checks to runtime source paths and maintain allowlists deliberately.

## Migration Plan

1. Add BFF dashboard schema types and resolver orchestration using existing data sources.
2. Add frontend GraphQL operation and regenerate Apollo types/hooks.
3. Replace Dashboard static arrays/cards with `useDashboardSummaryQuery`.
4. Replace Layout hardcoded condominium/badges with `me` and dashboard summary-derived values.
5. Remove admin fallback from social login and implement real or unsupported behavior.
6. Hide unsupported placeholder pages or replace them with real BFF-backed modules.
7. Route brigadier notification delivery through `notifyBrigadiers` only.
8. Expand `verify:runtime-mocks`, run frontend/BFF builds, and update `docs/ai/implementation-learnings.md` with any new concrete lesson.
