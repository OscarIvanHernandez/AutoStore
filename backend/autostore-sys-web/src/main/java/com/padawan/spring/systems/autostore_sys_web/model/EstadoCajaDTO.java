package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EstadoCajaDTO {
    private Long id;
    private boolean abierta;
    private LocalDateTime fechaApertura;
    private BigDecimal efectivoInicial;
    private BigDecimal ventasEfectivo;
    private BigDecimal efectivoEsperado;

    // Data - Getter y setters
}
