package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Entity 
@Table(name = "abonos")
@Data 
public class Abono {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id")
    @JsonIgnore
    private Venta venta;

    @Column (nullable = false)
    private BigDecimal monto;

    @Column (nullable = false)
    private LocalDateTime fecha;

    @Column (nullable = false)
    private BigDecimal saldoRestante;

    @Transient
    @JsonProperty("ventaId")
    public Long getVentaId() {
        return venta == null ? null : venta.getId();
    }
    
    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    };

    public Abono() {};

    public Abono(Cliente cliente, Venta venta, BigDecimal monto, BigDecimal saldoRestante) {
        this.cliente = cliente;
        this.venta = venta;
        this.monto = monto;
        this.saldoRestante = saldoRestante;
    };
};
