package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    private LocalDateTime fechaVenta;

    private BigDecimal subtotal;
    
    private BigDecimal descuento = BigDecimal.ZERO;

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoVenta tipoVenta = TipoVenta.CONTADO; // Default

    private Long clienteId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVenta estado;


    private String metodoPago;

    // Relación inversa con DetalleVenta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Indica que esta es la parte principal que SÍ se serializa
    private List<DetalleVenta> detalles = new ArrayList<>();

    // Validación: clienteId - nullable, solo si tipoVenta = CREDITO
    @AssertTrue(message = "El clienteId es obligatorio sí el tipo de venta es a CREDITOS")
    public boolean isClienteIdValido(){
        if (tipoVenta == TipoVenta.CREDITO) {
            return clienteId != null;
        }
        return true;
    }

    public void addDetalle(DetalleVenta detalle) {
        detalle.setVenta(this);
        detalles.add(detalle);
    }

    public void removeDetalle(DetalleVenta detalle) {
        detalles.remove(detalle);
        detalle.setVenta(null);
    }
}
