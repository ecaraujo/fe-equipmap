# Homologation Checklist

Use este checklist para registrar a validação da Fase C.11.

## Fluxos

- [ ] Login com `admin@equipmap.local` / `admin123`
- [ ] Seleção/listagem do condomínio seed
- [ ] CRUD de equipamentos via frontend/BFF
- [ ] Criação e conclusão de manutenção
- [ ] Criação de garantia e geração de URL de upload
- [ ] Consulta de notificações geradas pelos eventos
- [ ] Cadastro de apartamentos e vagas
- [ ] Execução de sorteio de vagas com seed registrado
- [ ] Cadastro de brigadistas
- [ ] Envio em massa para brigadistas ativos
- [ ] RBAC: viewer bloqueado em escrita
- [ ] Isolamento multi-tenant por `condominiumId`
- [ ] Jobs diários idempotentes
- [ ] Resiliência RabbitMQ: filas persistentes, DLQ/reprocessamento
- [ ] Latência p95 de queries simples menor ou igual a 500ms

## Pendências Pós-MVP

- Substituir provider mock/sandbox de WhatsApp/SMS por provider real.
- Adicionar observabilidade centralizada com logs estruturados e métricas.
- Automatizar este checklist em CI/staging com Testcontainers ou ambiente efêmero.
- Implementar seed de dados de demonstração para todos os domínios.
