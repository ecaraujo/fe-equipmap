CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE brigadiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    name VARCHAR(160) NOT NULL,
    role VARCHAR(40) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    email VARCHAR(160),
    active BOOLEAN NOT NULL DEFAULT true,
    certification_date DATE NOT NULL,
    certification_expiry DATE NOT NULL,
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_brigadiers_condominium_deleted ON brigadiers(condominium_id, deleted_at);
CREATE INDEX idx_brigadiers_role ON brigadiers(condominium_id, role);
CREATE INDEX idx_brigadiers_active ON brigadiers(condominium_id, active);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    brigadier_id UUID NOT NULL,
    recipient_name VARCHAR(160) NOT NULL,
    destination VARCHAR(160) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    provider_message_id VARCHAR(120),
    error_code VARCHAR(80),
    error_message TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notification_logs_condominium_created ON notification_logs(condominium_id, created_at);
CREATE INDEX idx_notification_logs_brigadier ON notification_logs(brigadier_id);
