package com.padawan.spring.systems.autostore_sys_web.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @NotBlank(message = "El nombre del producto no puede estar vacío")
    private String nombre;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    private String proveedor;

    @Column(nullable = false, precision = 19, scale = 2)
    @NotNull(message = "El precio de compra es obligatorio")
    @Positive(message = "El precio de compra debe ser mayor a $0")
    private BigDecimal precioCompra;

    @Column(nullable = false,precision = 19, scale = 2)
    @NotNull(message = "El precio de venta para mostrador es obligatorio")
    @Positive(message = "Precio de venta bajo, debe ser mayor a 0")
    private BigDecimal precioVentaMostrador;
    
    @Column(precision = 19, scale = 2)
    @Min(value = 0, message = "El precio de venta para taller no puede ser negativo")
    private BigDecimal precioVentaTaller;

    @Column(nullable = false)
    private Integer stockActual;

    @Column(nullable = false)
    @Min(value = 0, message = "El stock mínimo no puede ser un número negativo")
    private Integer stockMinimo;

    private String foto;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

}
