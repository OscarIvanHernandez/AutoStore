package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Table(name = "ventas")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Venta {
    
    @Id
    @GeneratedValue(strategy  = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaVenta;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime fechaVentaConFiado;   // Campo Extra: Fecha sí un cliente pide fiado

    @Column(precision = 19, scale = 2)
    @NotNull(message = "El subtotal de venta es obligatorio")
    @Positive(message = "El subtotal no puede ser negativo")
    @Min(value = 1, message = "El subtotal de venta no puede ser 0" )
    private BigDecimal subtotal;
    
    @Column(columnDefinition = "DECIMAL(19,2) DEFAULT 0.00")
    @Positive(message = "El descuento no puede ser negativo")
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @Column(columnDefinition = "DECIMAL(19,2) DEFAULT 0.00")
    @Positive(message = "El total de venta no puede ser negativo")
    private BigDecimal total;

    //private Enum tipoVenta

    private Long clienteId;

    //private Enum estado;
    
    private String metodoPago;
}
