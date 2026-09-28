package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity 
@Table (name = "devoluciones")
@Data 
public class Devoluciones {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, length = 255)
    private String motivo;

    @Column(nullable = false)
    private BigDecimal totalReembolso = BigDecimal.ZERO;

    @OneToMany(mappedBy = "devolucion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleDevolucion> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }

    public Devoluciones() {}

}
