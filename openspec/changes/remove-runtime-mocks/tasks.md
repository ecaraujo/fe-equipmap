## 1. Frontend Runtime Mock Removal

- [x] 1.1 Remove `apiConfig.useMock` behavior and make `VITE_API_BASE_URL` mandatory with a clear startup/configuration error.
- [x] 1.2 Remove `MOCK_USER`, local login fallback, and local switch-condominium fallback from `AuthContext`.
- [x] 1.3 Remove `MOCK_*` imports and local mock state from equipment, maintenance, warranty, parking, brigadier, and notification hooks/contexts.
- [x] 1.4 Replace frontend operations that still mutate local state in real mode with GraphQL mutations or explicit unsupported-operation errors.
- [x] 1.5 Remove or archive `src/app/data/appData.ts` mock-only exports that are no longer used by runtime code.
- [x] 1.6 Validate frontend build and login flow against `http://localhost:4000/graphql`.

## 2. BFF Runtime Mock Removal

- [x] 2.1 Change BFF configuration so real backend mode is the default and required runtime mode.
- [x] 2.2 Remove `MOCK_MODE` runtime branching from resolvers and require configured data sources for all operations.
- [x] 2.3 Remove `mock-data.ts`, faker dependency usage, and mock-only resolver helpers that are no longer reachable.
- [x] 2.4 Update or remove the isolated `bff-equipmap/docker-compose.yml` mock configuration.
- [x] 2.5 Update BFF README and smoke/contract tests to target real services or explicit test fixtures.
- [x] 2.6 Validate BFF build and contract/e2e smoke flow against the integrated Docker stack.

## 3. Microservice Messaging Mock Cleanup

- [x] 3.1 Rename `MockMessagingProvider` to an explicit sandbox provider name and document that it is local/MVP-only.
- [x] 3.2 Gate the sandbox messaging provider behind an explicit profile or environment property.
- [x] 3.3 Ensure production-like startup fails clearly when no real/sandbox messaging provider is configured.
- [x] 3.4 Keep Mockito/unit-test doubles intact and document them as tests, not runtime mocks.
- [x] 3.5 Validate brigadier bulk notification flow through RabbitMQ worker and notification logs.

## 4. Infra And Documentation

- [x] 4.1 Update `equipmap-infra/.env.example`, Docker Compose, and start scripts so frontend and BFF always point to the integrated backend.
- [x] 4.2 Update root README, BFF README, infra README, and PRD notes that still describe mock fallback as supported runtime behavior.
- [x] 4.3 Add a verification step that searches for forbidden runtime mock switches (`useMock`, `MOCK_MODE`, generic `Mock*Provider`) outside tests/docs/archive.
- [x] 4.4 Run full homologation scripts after cleanup and record any intentional remaining sandbox/test fixtures.
