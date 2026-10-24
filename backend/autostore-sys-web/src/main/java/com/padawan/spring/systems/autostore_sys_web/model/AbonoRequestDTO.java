package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AbonoRequestDTO {

    @NotNull(message = "La venta es obligatoria")
    private Long ventaId;

    @NotNull(message = "El monto del abono es obligatorio")
    @Positive(message = "El monto del abono debe ser mayor a cero")
    private BigDecimal monto;
}
