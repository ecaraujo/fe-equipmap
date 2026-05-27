CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    active_dependencies_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE condominium_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_email VARCHAR(320),
    user_name VARCHAR(160),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_condominium_user UNIQUE (condominium_id, user_id)
);

CREATE INDEX idx_condominium_users_user_id ON condominium_users(user_id);
CREATE INDEX idx_condominium_users_condominium_id ON condominium_users(condominium_id);
