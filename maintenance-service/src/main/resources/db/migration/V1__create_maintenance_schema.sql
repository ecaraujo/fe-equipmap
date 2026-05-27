CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    equipment VARCHAR(160) NOT NULL,
    equipment_id UUID,
    type VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    technician VARCHAR(160),
    provider VARCHAR(160),
    description TEXT NOT NULL,
    cost NUMERIC(14, 2),
    observations TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_maintenance_condominium_deleted ON maintenance_records(condominium_id, deleted_at);
CREATE INDEX idx_maintenance_status_scheduled ON maintenance_records(status, scheduled_date);
CREATE INDEX idx_maintenance_equipment ON maintenance_records(equipment_id);

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(80) NOT NULL,
    aggregate_id UUID NOT NULL,
    condominium_id UUID NOT NULL,
    routing_key VARCHAR(120) NOT NULL,
    payload TEXT NOT NULL,
    dedup_key VARCHAR(220) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_outbox_dedup_key UNIQUE (dedup_key)
);

CREATE INDEX idx_outbox_status_created ON outbox_events(status, created_at);
CREATE INDEX idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
