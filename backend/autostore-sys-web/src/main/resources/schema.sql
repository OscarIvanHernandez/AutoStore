ALTER TABLE IF EXISTS ventas
    DROP CONSTRAINT IF EXISTS ventas_estado_check;

ALTER TABLE IF EXISTS ventas
    ADD CONSTRAINT ventas_estado_check
    CHECK ((estado)::text = ANY (
        ARRAY[
            'COMPLETADA'::character varying,
            'CANCELADA'::character varying,
            'DEVOLUCION_PARCIAL'::character varying,
            'DEVOLUCION_TOTAL'::character varying
        ]
    ));

ALTER TABLE IF EXISTS ventas
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20);

ALTER TABLE IF EXISTS ventas
    ADD COLUMN IF NOT EXISTS saldo_pendiente NUMERIC(19, 2);

ALTER TABLE IF EXISTS ventas
    DROP CONSTRAINT IF EXISTS ventas_estado_pago_check;

ALTER TABLE IF EXISTS ventas
    ADD CONSTRAINT ventas_estado_pago_check
    CHECK (estado_pago IN ('PENDIENTE', 'PARCIAL', 'PAGADO'));

ALTER TABLE IF EXISTS ventas
    DROP CONSTRAINT IF EXISTS ventas_saldo_pendiente_check;

ALTER TABLE IF EXISTS ventas
    ADD CONSTRAINT ventas_saldo_pendiente_check
    CHECK (saldo_pendiente >= 0);

ALTER TABLE IF EXISTS abonos
    ADD COLUMN IF NOT EXISTS venta_id BIGINT;
