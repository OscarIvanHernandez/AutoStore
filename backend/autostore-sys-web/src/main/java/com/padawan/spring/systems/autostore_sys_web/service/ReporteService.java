package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.ReporteGananciasDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TopProductoDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.DetalleVentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@Service 
public class ReporteService {
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private VentaRepository ventaRepository;

    public ReporteGananciasDTO obtenerGanancias(LocalDate desde, LocalDate hasta) {
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(LocalTime.MAX);

        BigDecimal ventasTotales = detalleVentaRepository.sumarVentasTotales(inicio, fin);
        BigDecimal costoTotal = detalleVentaRepository.sumarCostosTotales(inicio, fin);
        
        ventasTotales = ventasTotales != null ? ventasTotales : BigDecimal.ZERO;
        costoTotal = costoTotal != null ? costoTotal : BigDecimal.ZERO;
        
        BigDecimal gananciaNeta = ventasTotales.subtract(costoTotal);
        Integer cantidadVentas = ventaRepository.contarVentasEnPeriodo(inicio, fin);
        Integer productosVendidos = detalleVentaRepository.sumarProductosVendidos(inicio, fin);

        return new ReporteGananciasDTO(ventasTotales, gananciaNeta, costoTotal, cantidadVentas, productosVendidos);
    }

    public List<TopProductoDTO> obtenerTopProductos(LocalDate desde, LocalDate hasta, int limite) {
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(LocalTime.MAX);
        return detalleVentaRepository.obtenerTopProductos(inicio, fin, PageRequest.of(0, limite));
    }

    public byte[] generarCsvGanancias(LocalDate desde, LocalDate hasta) {
        ReporteGananciasDTO reporte = obtenerGanancias(desde, hasta);
        StringBuilder sb = new StringBuilder();
        
        // BOM UTF-8 para compatibilidad directa con Excel
        sb.append("\uFEFF");
        sb.append("Métrica,Valor\n");
        sb.append("Período Desde,").append(desde).append("\n");
        sb.append("Período Hasta,").append(hasta).append("\n");
        sb.append("Ventas Totales,$").append(reporte.getVentasTotales()).append("\n");
        sb.append("Costo Total,$").append(reporte.getCostoTotal()).append("\n");
        sb.append("Ganancia Neta,$").append(reporte.getGananciaNeta()).append("\n");
        sb.append("Cantidad de Ventas,").append(reporte.getCantidadVentas()).append("\n");
        sb.append("Productos Vendidos,").append(reporte.getProductosVendidos()).append("\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
