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
