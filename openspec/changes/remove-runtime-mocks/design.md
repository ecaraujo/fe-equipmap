## Context

O projeto nasceu em fases: frontend com dados locais, BFF mockado para estabilizar contrato GraphQL, depois microservicos reais e BFF integrado. A Fase C.11 validou a stack real via `equipmap-infra`, mas os caminhos mock continuam no codigo e em alguns casos continuam acessiveis por configuracao.

Fluxo desejado apos esta mudanca:

```
Frontend
  |
  | VITE_API_BASE_URL obrigatorio
  v
BFF GraphQL
  |
  | service URLs obrigatorias
  v
Microservicos reais + PostgreSQL + RabbitMQ + MinIO
```

## Goals / Non-Goals

**Goals:**
- Eliminar mocks runtime do frontend.
- Eliminar fallback mock runtime do BFF.
- Garantir que operacoes CRUD do frontend chamem GraphQL ou retornem erro claro quando ainda nao suportadas.
- Tornar o provider de mensagem dos brigadistas explicitamente sandbox/dev, sem parecer provider real nem fallback automatico.
- Manter testes unitarios e dados seed quando fizerem parte de test/dev setup, sem confundir com runtime da aplicacao.

**Non-Goals:**
- Integrar provedor real WhatsApp/SMS nesta mudanca.
- Remover dados seed de auth/condominio necessarios para ambiente local.
- Remover mocks de testes unitarios baseados em Mockito.

## Decisions

1. Frontend deve falhar cedo se `VITE_API_BASE_URL` estiver ausente.
   - Rationale: evita login falso e telas operando sem backend.
   - Alternativa rejeitada: manter fallback silencioso para `appData.ts`, pois mascara problemas de ambiente.

2. BFF deve ter `MOCK_MODE=false` como comportamento unico de runtime suportado.
   - Rationale: a fase de contrato mock ja foi concluida.
   - Alternativa rejeitada: manter `MOCK_MODE=true` para dev rapido, pois hoje ele diverge da stack real e do objetivo de homologacao.

3. Provider de mensagens do brigadier-service deve ser renomeado/configurado como sandbox explicito.
   - Rationale: no MVP o envio externo real ainda nao existe, mas o componente nao deve ser confundido com mock generico nem acionado por acidente em perfil produtivo.
   - Alternativa rejeitada: remover completamente o provider, pois quebraria o fluxo homologado de notificacao de brigadistas.

4. Seeds e mocks de teste permanecem permitidos.
   - Rationale: `AUTH_SEED_*`, condominium seed, lottery seed e Mockito em testes nao sao fallback funcional de runtime.

## Risks / Trade-offs

- Ambientes locais sem `.env` passam a quebrar mais cedo -> mitigar com mensagem clara no startup e script `npm run start:local`.
- Remover `mock-data.ts` do BFF pode exigir ajustar smoke tests antigos -> mitigar migrando testes para contract/e2e contra a stack real.
- Algumas telas podem depender de operacoes ainda nao implementadas no GraphQL -> mitigar transformando fallback local em erro explicito ou implementando a mutation real.

## Migration Plan

1. Remover fallback mock do frontend e validar build.
2. Corrigir hooks parcialmente locais para chamar GraphQL real ou expor erro claro.
3. Remover modo mock do BFF e limpar compose isolado/documentacao.
4. Renomear/configurar provider sandbox de brigadistas.
5. Rodar build frontend, build BFF e homologacao via `equipmap-infra`.

Rollback: reverter esta change. Nao manter flag de mock escondida como rollback runtime.
