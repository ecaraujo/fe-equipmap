## Context

O PRD 001 adicionou a US06A para transformar apartamentos/unidades em uma capacidade real do EquipMap. Hoje existe uma entidade `Apartment` no `parking-service`, mas ela atende principalmente o sorteio de vagas e persiste apenas `unit`, `block`, `owner` e `hasVehicle`.

O BFF ja expoe `Apartment`, `CreateApartmentInput`, `UpdateApartmentInput` e mutations `createParkingApartment`, `updateParkingApartment`, `deleteParkingApartment`, mas o resolver atual remove `phone`, `email` e `floor` antes de chamar o `parking-service`, porque o microservico ainda nao persiste esses campos.

No frontend, `ParkingLotteryPage` ja possui uma aba de apartamentos e usa `useParking`, mas nao ha uma pagina independente `Apartamentos` no menu principal. O PRD agora exige duas entradas de UI compartilhadas: cadastro dentro de `Sorteio de Vagas` e modulo independente `Apartamentos`, preparando modularizacao comercial futura.

Tambem ha uma decisao transversal: cada task implementada deve passar por SonarCloud/SonarQube antes de ser marcada como concluida.

## Goals / Non-Goals

**Goals:**

- Expandir o contrato real de apartamentos no `parking-service`.
- Manter o sorteio de vagas funcionando com `Apartment.hasVehicle`, snapshots e regras transacionais existentes.
- Criar uma experiencia independente `Apartamentos` abaixo de `Garantias`.
- Manter cadastro de apartamentos dentro de `Sorteio de Vagas`, reutilizando componentes e mutations.
- Garantir que dados de proprietario, inquilino, contatos e datas sejam persistidos no banco, expostos pelo BFF e consumidos via Apollo.
- Padronizar telefone e datas conforme PRD e licoes aprendidas.
- Fazer cada task incluir verificacao SonarCloud/SonarQube sem novos achados nao tratados.

**Non-Goals:**

- Criar um novo microservico de unidades no MVP.
- Separar comercialmente os modulos durante o MVP.
- Migrar dados legados externos.
- Implementar historico completo de locacoes ou multiplos inquilinos por unidade.
- Reintroduzir mocks, fallback local, arrays demo ou mutacoes apenas em estado React.

## Decisions

### 1. `parking-service` continua dono de `Apartment` no MVP

O `parking-service` ja possui tabela, entidade, endpoints e uso transacional de `Apartment` no sorteio. Expandir essa entidade reduz duplicidade e mantem um unico cadastro para sorteio e gestao de unidades.

Alternativa considerada: criar `unit-service` ou mover para `condominium-service`. Isso foi adiado para pos-MVP porque aumentaria escopo, exigiria sincronizacao entre servicos e poderia quebrar o sorteio.

### 2. Contrato GraphQL tera nomes semanticos e compatibilidade com parking

O BFF deve expor o cadastro completo em `Apartment`. A implementacao pode manter `parkingApartments` e mutations `createParkingApartment` para compatibilidade com `ParkingLotteryPage`, mas deve considerar aliases semanticos como `apartments`, `createApartment`, `updateApartment` e `deleteApartment` se isso simplificar a pagina independente.

Ambas as entradas de UI devem usar o mesmo contrato real, nao duplicar payloads nem criar rotas fake.

### 3. Componentes de apartamento devem ser compartilhados

O formulario e a listagem de apartamentos devem sair do acoplamento exclusivo de `ParkingLotteryPage`. A pagina `Apartamentos` e a aba de apartamentos em `Sorteio de Vagas` devem reutilizar componentes base, validacoes e hook/mutations.

Isso prepara modularizacao futura e evita divergencia de comportamento entre os dois pontos de entrada.

### 4. Datas e telefones seguem os helpers existentes

Telefone deve ser exibido como `(xx)xxxxx-xxxx` e enviado apenas com digitos, usando `src/utils/format.ts` e mapeadores em `src/graphql/inputs.ts`.

Datas de contrato devem ser enviadas ao backend em ISO `yyyy-MM-dd`. Inputs React nao devem armazenar strings localizadas que quebrem `<input type="date">`.

### 5. Banco deve preservar dados atuais

A migration Flyway deve adicionar novos campos sem perder apartamentos existentes. O campo atual `owner` deve ser migrado para `owner_name` ou mantido com mapeamento explicito ate a transicao estar segura.

Unicidade de `unit + block + condominiumId` deve considerar registros ativos. Se `block` permanecer nullable, a constraint deve tratar nulos corretamente; preferencialmente `block` deve ser obrigatorio no contrato novo.

### 6. SonarCloud/SonarQube e parte do fluxo de task

Cada task deve terminar com uma verificacao SonarCloud/SonarQube dos arquivos alterados. Novos achados devem ser corrigidos antes de marcar a task como concluida. Falsos positivos exigem justificativa concreta no artefato ou no resumo da task.

## Risks / Trade-offs

- Sorteio quebrar por mudanca em `Apartment` -> manter `unit`, `block`, `owner/ownerName`, `hasVehicle` e snapshots de `LotteryResult` compativeis; cobrir com testes de sorteio.
- Constraint unica permitir duplicatas quando `block` for nulo -> tornar `block` obrigatorio ou usar indice unico com normalizacao.
- UI duplicar logica entre `Apartamentos` e `Sorteio de Vagas` -> extrair componentes compartilhados antes de ligar a segunda entrada.
- BFF descartar campos novos -> remover allowlist antiga somente depois que o `parking-service` persistir/retornar os campos; manter resolvers defensivos para compatibilidade temporaria.
- Codegen quebrar por tipos duplicados -> atualizar `operations.graphql` e rodar codegen; nao editar `src/graphql/generated.tsx` manualmente.
- SonarCloud remoto indisponivel -> usar SonarQube/IDE local como evidencia temporaria, registrar limitacao e nao ignorar achados visiveis.

## Migration Plan

1. Criar migration Flyway no `parking-service` adicionando campos novos e preservando dados existentes.
2. Atualizar entidade, DTOs, service, repository e testes do `parking-service`.
3. Atualizar BFF schema/resolvers para expor campos completos e mapear para REST real.
4. Atualizar operations GraphQL e regenerar hooks.
5. Extrair componentes/hook de apartamentos compartilhados.
6. Criar pagina `Apartamentos` e manter aba em `Sorteio de Vagas` usando os mesmos componentes.
7. Executar builds, testes relevantes, runtime mock guard e analise SonarCloud/SonarQube por task.

Rollback: manter migrations aditivas e compatibilidade temporaria entre `owner` e `ownerName` para permitir reversao de frontend/BFF sem perder dados persistidos.

## Open Questions

- O documento do proprietario/inquilino sera CPF/CNPJ livre ou deve haver validacao formal no MVP?
- `block` deve ser obrigatorio para todas as unidades ou pode ser default como `A` para condominios sem bloco?
- A pagina `Apartamentos` exibira badge no menu ja no MVP ou isso ficara para quando `dashboardSummary` incluir total de apartamentos?
