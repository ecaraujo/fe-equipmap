## Why

O backend MVP ja foi homologado com BFF e microservicos reais, mas ainda existem caminhos de mock em runtime no frontend, no BFF e no brigadier-service. Isso cria risco de testes falsamente positivos, comportamento diferente entre ambientes e erros quando variaveis de ambiente estao ausentes ou quando o compose isolado do BFF e usado.

## What Changes

- **BREAKING**: Remover o modo mock local do frontend; `VITE_API_BASE_URL` passa a ser obrigatorio para execucao integrada.
- **BREAKING**: Remover o modo mock runtime do BFF; o BFF deve usar microservicos reais por padrao e falhar explicitamente quando URLs obrigatorias nao estiverem configuradas.
- Substituir o provider `MockMessagingProvider` do brigadier-service por um provider sandbox explicitamente nomeado/configurado, deixando claro que nao e fallback mock generico.
- Corrigir hooks do frontend que ainda executam operacoes apenas em estado local mesmo com backend real configurado.
- Atualizar scripts, Docker Compose e documentacao para refletir uma unica forma suportada de execucao local integrada.

## Capabilities

### New Capabilities
- `runtime-mock-removal`: Define que os caminhos runtime de mock devem ser removidos ou tornados explicitamente sandbox/dev-only, garantindo execucao integrada contra backend real.

### Modified Capabilities

## Impact

- Frontend React: `src/config/api.config.ts`, contexts, hooks, `src/app/data/appData.ts`, README e envs.
- BFF GraphQL: `bff-equipmap/src/config.ts`, `resolvers.ts`, `mock-data.ts`, compose isolado, testes e README.
- Brigadier service: `MockMessagingProvider`, configuracao DI/profiles e documentacao do provider de mensagens.
- Infra: `equipmap-infra/docker-compose.yml`, `.env.example`, scripts de start/homologacao e documentacao operacional.
