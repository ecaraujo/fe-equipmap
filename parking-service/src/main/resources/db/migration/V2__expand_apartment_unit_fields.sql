ALTER TABLE apartments ADD COLUMN owner_name VARCHAR(160);
ALTER TABLE apartments ADD COLUMN floor INTEGER;
ALTER TABLE apartments ADD COLUMN owner_document VARCHAR(32);
ALTER TABLE apartments ADD COLUMN owner_phone VARCHAR(20);
ALTER TABLE apartments ADD COLUMN owner_email VARCHAR(160);
ALTER TABLE apartments ADD COLUMN is_rented BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE apartments ADD COLUMN tenant_name VARCHAR(160);
ALTER TABLE apartments ADD COLUMN tenant_document VARCHAR(32);
ALTER TABLE apartments ADD COLUMN tenant_phone VARCHAR(20);
ALTER TABLE apartments ADD COLUMN tenant_email VARCHAR(160);
ALTER TABLE apartments ADD COLUMN rental_start DATE;
ALTER TABLE apartments ADD COLUMN rental_end DATE;
ALTER TABLE apartments ADD COLUMN observations VARCHAR(1000);

UPDATE apartments
SET owner_name = owner
WHERE owner_name IS NULL;

UPDATE apartments
SET block = 'A'
WHERE block IS NULL OR trim(block) = '';

ALTER TABLE apartments ALTER COLUMN owner_name SET NOT NULL;
ALTER TABLE apartments ALTER COLUMN block SET NOT NULL;

ALTER TABLE apartments DROP CONSTRAINT IF EXISTS uk_apartment_unit_block;

CREATE UNIQUE INDEX uk_apartment_unit_block_active
    ON apartments(condominium_id, lower(unit), lower(block))
    WHERE deleted_at IS NULL;
