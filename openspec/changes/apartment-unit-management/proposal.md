## Why

O PRD agora exige que apartamentos/unidades sejam uma capacidade real do EquipMap, com cadastro completo de proprietario, inquilino e contatos, acessivel tanto no modulo `Apartamentos` quanto dentro de `Sorteio de Vagas`.

Tambem foi definido que cada task implementada deve passar por analise SonarCloud/SonarQube, evitando que novas features acumulem bugs, vulnerabilidades, security hotspots, code smells ou divida tecnica silenciosa.

## What Changes

- Expandir o dominio de apartamentos no `parking-service`, mantendo compatibilidade com o sorteio de vagas e persistindo dados cadastrais completos.
- Expor no BFF GraphQL o contrato completo de apartamentos/unidades, sem descartar campos persistidos pelo backend.
- Criar uma entrada independente `Apartamentos` no menu principal abaixo de `Garantias`.
- Manter o cadastro de apartamentos tambem acessivel dentro de `Sorteio de Vagas`, reutilizando os mesmos componentes, hooks, mutations e validacoes.
- Padronizar telefone em formularios como `(xx)xxxxx-xxxx`, enviando apenas digitos ao backend.
- Padronizar datas de contrato em ISO `yyyy-MM-dd` no payload, preservando exibicao amigavel no frontend.
- Acrescentar verificacao SonarCloud/SonarQube como criterio obrigatorio de conclusao para cada task implementada.
- Nao reintroduzir mocks, dados locais, fallback runtime ou edicao manual de `src/graphql/generated.tsx`.

## Capabilities

### New Capabilities

- `apartment-unit-management`: Cadastro real de apartamentos/unidades por condominio, com proprietario, inquilino, contatos, status de locacao, elegibilidade para sorteio e duas entradas de UI compartilhadas.
- `task-quality-gate`: Regra transversal para que toda task OpenSpec implementada registre analise SonarCloud/SonarQube e nao deixe novos achados sem correcao ou justificativa.

### Modified Capabilities

- None.

## Impact

- `parking-service`: entidade `Apartment`, Flyway migrations, DTOs REST, validacoes, repository, service, controller, OpenAPI e testes.
- `bff-equipmap`: schema GraphQL, resolvers, mapeamento REST para o `parking-service`, dashboard/sidebar quando houver badge de apartamentos, build e contract tests.
- `src/graphql`: operations, generated hooks, models, mappers e inputs.
- `src/app`: `Layout`, `App`, nova pagina `Apartamentos`, componentes compartilhados de formulario/listagem e ajuste de `ParkingLotteryPage`.
- `src/hooks`: hook compartilhado para apartamentos ou refatoracao do `useParking` para separar apartamentos de sorteio.
- `docs/ai/implementation-learnings.md`: deve continuar registrando novas licoes nao triviais.
- Processo OpenSpec: cada task deve incluir verificacao SonarCloud/SonarQube antes de ser marcada como concluida.
