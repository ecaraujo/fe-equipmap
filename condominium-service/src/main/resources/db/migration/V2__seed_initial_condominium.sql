INSERT INTO condominiums (id, name, cnpj, address, timezone, active)
VALUES (
    '${equipmap.condominium.seed.id}',
    '${equipmap.condominium.seed.name}',
    '${equipmap.condominium.seed.cnpj}',
    '${equipmap.condominium.seed.address}',
    '${equipmap.condominium.seed.timezone}',
    TRUE
)
ON CONFLICT (cnpj) DO NOTHING;
