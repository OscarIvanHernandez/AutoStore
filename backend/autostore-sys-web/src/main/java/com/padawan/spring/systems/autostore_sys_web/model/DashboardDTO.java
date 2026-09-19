package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DashboardDTO {
    private GananciasHoy gananciasHoy;
    private List<ProductoStockBajo> stockBajo;
    private DeudoresResumen deudores;
    private List<UltimaVenta> ultimasVentas;

    public DashboardDTO(GananciasHoy gananciasHoy, List<ProductoStockBajo> stockBajo, DeudoresResumen deudores, List<UltimaVenta> ultimasVentas) {
        this.gananciasHoy = gananciasHoy;
        this.stockBajo = stockBajo;
        this.deudores = deudores;
        this.ultimasVentas = ultimasVentas;
    }

    // Inner Classes para estructurar la respuesta
    public static class GananciasHoy {
        public BigDecimal ventas;
        public BigDecimal ganancia;
        public Integer cantidad;

        public GananciasHoy(BigDecimal ventas, BigDecimal ganancia, Integer cantidad) {
            this.ventas = ventas != null ? ventas : BigDecimal.ZERO;
            this.ganancia = ganancia != null ? ganancia : BigDecimal.ZERO;
            this.cantidad = cantidad != null ? cantidad : 0;
        }
    }

    public static class ProductoStockBajo {
        public Long productoId;
        public String nombre;
        public Integer stock;
        public Integer stockMinimo;

        public ProductoStockBajo(Long productoId, String nombre, Integer stock, Integer stockMinimo) {
            this.productoId = productoId;
            this.nombre = nombre;
            this.stock = stock;
            this.stockMinimo = stockMinimo;
        }
    }

    public static class DeudoresResumen {
        public Long cantidad;
        public BigDecimal sumaDeudas;

        public DeudoresResumen(Long cantidad, BigDecimal sumaDeudas) {
            this.cantidad = cantidad != null ? cantidad : 0L;
            this.sumaDeudas = sumaDeudas != null ? sumaDeudas : BigDecimal.ZERO;
        }
    }

    public static class UltimaVenta {
        public Long id;
        public LocalDateTime fecha;
        public BigDecimal total;
        public String tipoVenta;
        public String cliente;

        public UltimaVenta(Long id, LocalDateTime fecha, BigDecimal total, String tipoVenta, String cliente) {
            this.id = id;
            this.fecha = fecha;
            this.total = total;
            this.tipoVenta = tipoVenta;
            this.cliente = cliente != null ? cliente : "Público general";
        }
    }

    // Getters
    public GananciasHoy getGananciasHoy() { return gananciasHoy; }
    public List<ProductoStockBajo> getStockBajo() { return stockBajo; }
    public DeudoresResumen getDeudores() { return deudores; }
    public List<UltimaVenta> getUltimasVentas() { return ultimasVentas; }
}
