package com.padawan.spring.systems.autostore_sys_web.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name ="productos")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String marca;

    @Column(nullable = false, length = 100)
    private String categoria;

    private String proveedor;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal precioCompra;

    @Column(nullable = false,precision = 19, scale = 2)
    private BigDecimal precioVentaMostrador;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal precioVentaTaller;

    @Column(nullable = false)
    private Integer stockActual;

    @Column(nullable = false)
    private Integer stockMinimo;

    private String foto;

    @Column(nullable = false)
    private Boolean activo;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

}
