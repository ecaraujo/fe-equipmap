CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    unit VARCHAR(40) NOT NULL,
    block VARCHAR(80),
    owner VARCHAR(160) NOT NULL,
    has_vehicle BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uk_apartment_unit_block UNIQUE (condominium_id, unit, block)
);

CREATE INDEX idx_apartments_condominium_deleted ON apartments(condominium_id, deleted_at);
CREATE INDEX idx_apartments_vehicle ON apartments(condominium_id, has_vehicle);

CREATE TABLE parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    number VARCHAR(40) NOT NULL,
    type VARCHAR(40) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uk_parking_spot_number UNIQUE (condominium_id, number)
);

CREATE INDEX idx_parking_spots_condominium_deleted ON parking_spots(condominium_id, deleted_at);

CREATE TABLE lottery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    seed BIGINT NOT NULL,
    drawn_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    undrawn_apartments TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX idx_lottery_sessions_condominium_drawn ON lottery_sessions(condominium_id, drawn_at);

CREATE TABLE lottery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL,
    lottery_session_id UUID NOT NULL REFERENCES lottery_sessions(id) ON DELETE CASCADE,
    apartment_id UUID NOT NULL,
    parking_spot_id UUID NOT NULL,
    unit VARCHAR(40) NOT NULL,
    block VARCHAR(80),
    owner VARCHAR(160) NOT NULL,
    spot_number VARCHAR(40) NOT NULL,
    spot_type VARCHAR(40) NOT NULL,
    seed BIGINT NOT NULL,
    drawn_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_lottery_apartment UNIQUE (condominium_id, apartment_id),
    CONSTRAINT uk_lottery_spot UNIQUE (condominium_id, parking_spot_id)
);

CREATE INDEX idx_lottery_results_session ON lottery_results(lottery_session_id);
CREATE INDEX idx_lottery_results_condominium ON lottery_results(condominium_id);
