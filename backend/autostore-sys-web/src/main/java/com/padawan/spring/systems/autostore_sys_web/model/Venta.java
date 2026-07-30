package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ventas")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Venta {
    
    private Long id;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    //private Enum tipoVenta
    private Long clienteId;
    //private Enum estado;
    private String metodoPago;
}
