package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;

import lombok.Data;

@Data 
public class ReporteGananciasDTO {
    private BigDecimal ventasTotales;
    private BigDecimal gananciaNeta;
    private BigDecimal costoTotal;
    private Integer cantidadVentas;
    private Integer productosVendidos;

    public ReporteGananciasDTO(
        BigDecimal ventasTotales, BigDecimal gananciaNeta, 
        BigDecimal costoTotal, Integer cantidadVentas, Integer productosVendidos) 
        {
        this.ventasTotales = ventasTotales != null ? ventasTotales : BigDecimal.ZERO;
        this.gananciaNeta = gananciaNeta != null ? gananciaNeta : BigDecimal.ZERO;
        this.costoTotal = costoTotal != null ? costoTotal : BigDecimal.ZERO;
        this.cantidadVentas = cantidadVentas != null ? cantidadVentas : 0;
        this.productosVendidos = productosVendidos != null ? productosVendidos : 0;
        }
}
