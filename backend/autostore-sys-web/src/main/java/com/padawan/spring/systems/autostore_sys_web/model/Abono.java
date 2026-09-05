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

    @Column (nullable = false)
    private BigDecimal monto;

    @Column (nullable = false)
    private LocalDateTime fecha;

    @Column (nullable = false)
    private BigDecimal saldoRestante;
    
    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }

    public Abono() {}

    public Abono(Cliente cliente, BigDecimal monto, BigDecimal saldoRestante) {
        this.cliente = cliente;
        this.monto = monto;
        this.saldoRestante = saldoRestante;
    }
}
