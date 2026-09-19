package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;

import lombok.Data;

@Data 
public class TopProductoDTO {
    private Long productoId;
    private String nombre;
    private String marca;
    private Long cantidadVendida;
    private BigDecimal totalVentas;
    private BigDecimal gananciaGenerada;

    public TopProductoDTO(
        Long productoId, String nombre, String marca, 
        Long cantidadVendida, BigDecimal totalVentas, BigDecimal gananciaGenerada) 
        {
        this.productoId = productoId;
        this.nombre = nombre;
        this.marca = marca;
        this.cantidadVendida = cantidadVendida != null ? cantidadVendida : 0L;
        this.totalVentas = totalVentas != null ? totalVentas : BigDecimal.ZERO;
        this.gananciaGenerada = gananciaGenerada != null ? gananciaGenerada : BigDecimal.ZERO;
    }
}
