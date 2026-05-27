CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    equipment VARCHAR(160) NOT NULL,
    equipment_id UUID,
    brand VARCHAR(120) NOT NULL,
    model VARCHAR(120) NOT NULL,
    serial_number VARCHAR(120),
    supplier VARCHAR(160) NOT NULL,
    supplier_contact VARCHAR(160),
    purchase_date DATE NOT NULL,
    warranty_start DATE NOT NULL,
    warranty_end DATE NOT NULL,
    warranty_months INTEGER NOT NULL,
    type VARCHAR(40) NOT NULL,
    observations TEXT,
    document_object_key VARCHAR(500),
    document_file_name VARCHAR(255),
    document_mime_type VARCHAR(120),
    document_size_bytes BIGINT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

CREATE INDEX idx_warranties_condominium_deleted ON warranties(condominium_id, deleted_at);
CREATE INDEX idx_warranties_equipment ON warranties(equipment_id);
CREATE INDEX idx_warranties_end ON warranties(warranty_end);
CREATE INDEX idx_warranties_type ON warranties(type);

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
