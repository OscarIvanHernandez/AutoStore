package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "cortes_caja")
@Data
public class CorteCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaApertura;

    private LocalDateTime fechaCierre;

    @Column(nullable = false)
    private BigDecimal efectivoInicial;
    private BigDecimal efectivoEsperado; 
    private BigDecimal efectivoReal;
    private BigDecimal diferencia;

    @Column(nullable = false)
    private boolean activo = true;

    public CorteCaja() {}

    public CorteCaja(BigDecimal efectivoInicial) {
        this.fechaApertura = LocalDateTime.now();
        this.efectivoInicial = efectivoInicial;
        this.activo = true;
    }
}
