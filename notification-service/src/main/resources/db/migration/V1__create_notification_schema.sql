CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(60) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    resource_id VARCHAR(120) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    dedup_key VARCHAR(320) NOT NULL,
    payload TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_condominium
    ON notifications (user_id, condominium_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uk_notifications_active_dedup
    ON notifications (dedup_key)
    WHERE deleted_at IS NULL;
