CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    name VARCHAR(160) NOT NULL,
    type VARCHAR(40) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    model VARCHAR(120) NOT NULL,
    serial_number VARCHAR(120) NOT NULL,
    patrimony_code VARCHAR(40) NOT NULL,
    location VARCHAR(160) NOT NULL,
    status VARCHAR(40) NOT NULL,
    acquisition_date DATE NOT NULL,
    warranty_expiry DATE NOT NULL,
    last_maintenance DATE,
    next_maintenance DATE NOT NULL,
    equipment_value NUMERIC(14, 2) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    CONSTRAINT uk_equipment_condominium_patrimony UNIQUE (condominium_id, patrimony_code),
    CONSTRAINT ck_equipment_value_non_negative CHECK (equipment_value >= 0),
    CONSTRAINT ck_equipment_maintenance_date CHECK (next_maintenance >= acquisition_date)
);

CREATE INDEX idx_equipment_condominium_deleted ON equipment(condominium_id, deleted_at);
CREATE INDEX idx_equipment_type_status ON equipment(type, status);
CREATE INDEX idx_equipment_next_maintenance ON equipment(next_maintenance);
CREATE INDEX idx_equipment_warranty_expiry ON equipment(warranty_expiry);

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(80) NOT NULL,
    aggregate_id UUID NOT NULL,
    condominium_id UUID NOT NULL,
    routing_key VARCHAR(120) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_status_created ON outbox_events(status, created_at);
CREATE INDEX idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
