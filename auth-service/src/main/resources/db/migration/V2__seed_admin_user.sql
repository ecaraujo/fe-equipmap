INSERT INTO users (id, email, password_hash, name, provider, active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '${equipmap.auth.seed.admin-email}',
    '{bcrypt}$2a$12$Ycr5hlgX1Tga8Y/AZ/B50u0cD1dMx2DdP5Mw9gC4ZL.dsfAvpCopu',
    'Administrador EquipMap',
    'LOCAL',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_condominiums (
    id,
    user_id,
    condominium_id,
    condominium_name,
    condominium_cnpj,
    condominium_address,
    condominium_timezone,
    role,
    active
)
VALUES (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    '${equipmap.auth.seed.condominium-id}',
    '${equipmap.auth.seed.condominium-name}',
    '${equipmap.auth.seed.condominium-cnpj}',
    '${equipmap.auth.seed.condominium-address}',
    '${equipmap.auth.seed.condominium-timezone}',
    'ADMIN',
    TRUE
)
ON CONFLICT (user_id, condominium_id) DO NOTHING;
