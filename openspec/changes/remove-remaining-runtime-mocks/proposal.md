## Why

EquipMap already removed the broad runtime mock mode, but the frontend still renders operational data from hardcoded arrays, badges, placeholder pages, and a social-login admin fallback. This causes the UI to look integrated while some visible information does not come from the BFF or the backend microservices.

## What Changes

- Add a real Dashboard GraphQL contract in the BFF, such as `dashboardSummary`, that orchestrates equipment, maintenance, warranty, notification, condominium, and other needed service calls.
- Replace Dashboard hardcoded cards, charts, recent equipment, and upcoming maintenance lists with Apollo data from the BFF.
- Replace Layout hardcoded condominium labels and navigation badges with real data from `me`, condominium data, or the dashboard summary.
- Remove the social login fallback that authenticates Google/Microsoft buttons as `admin@equipmap.local`; either wire real social auth or return an explicit unsupported-operation state.
- Hide or implement pages that do not yet have backend support (`locations`, `checklists`, `documents`, `qrcodes`, `reports`) so placeholder screens are not presented as real functionality.
- Review brigadier notification templates and sending flow so operational content and delivery are owned by the BFF/backend, not local frontend-only behavior.
- Strengthen runtime mock verification to block known operational demo values and patterns such as `EQ-001`, `Residencial Park`, `2.4k+`, static Dashboard arrays, and admin social-login fallback.

## Capabilities

### New Capabilities
- `remaining-runtime-mock-removal`: Ensures every visible operational frontend value is sourced from the BFF, and every BFF value is resolved from real microservice APIs or explicit unsupported states.

### Modified Capabilities

## Impact

- Frontend React: `src/app/components/DashboardPage.tsx`, `Layout.tsx`, `LoginPage.tsx`, `BrigadiersPage.tsx`, `App.tsx`, GraphQL operations, generated hooks, and related mappings.
- BFF GraphQL: `bff-equipmap/schema.graphql`, `src/resolvers.ts`, `src/data-sources.ts`, type mappings, config, and build/codegen workflow.
- Backend services: possible summary/count/filter endpoints or BFF orchestration requirements for equipment, maintenance, warranty, condominium, notification, and brigadier data.
- Infra and validation: `equipmap-infra/scripts/verify-runtime-mocks.mjs`, local startup docs, and AI implementation learnings.
