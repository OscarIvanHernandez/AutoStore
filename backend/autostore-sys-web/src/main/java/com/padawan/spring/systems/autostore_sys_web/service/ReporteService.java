package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.ReporteGananciasDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TopProductoDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.DetalleVentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@Service 
public class ReporteService {
    private static final DateTimeFormatter FORMATO_FECHA_CSV = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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
        Long productosVendidosTotal = detalleVentaRepository.sumarProductosVendidos(inicio, fin);
        Integer productosVendidos = productosVendidosTotal != null ? productosVendidosTotal.intValue() : 0;

        return new ReporteGananciasDTO(ventasTotales, gananciaNeta, costoTotal, cantidadVentas, productosVendidos);
    }

    public List<TopProductoDTO> obtenerTopProductos(LocalDate desde, LocalDate hasta, int limite) {
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(LocalTime.MAX);
        return detalleVentaRepository.obtenerTopProductos(inicio, fin, PageRequest.of(0, Math.max(1, limite)));
    }

    public byte[] generarCsvGanancias(LocalDate desde, LocalDate hasta, int limite) {
        ReporteGananciasDTO reporte = obtenerGanancias(desde, hasta);
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(LocalTime.MAX);
        List<TopProductoDTO> productosVendidos = detalleVentaRepository.obtenerTopProductos(
                inicio, fin, Pageable.unpaged());
        List<TopProductoDTO> topProductos = obtenerTopProductos(desde, hasta, limite);
        StringBuilder sb = new StringBuilder();

        // BOM UTF-8 para compatibilidad directa con Excel
        sb.append("\uFEFF");
        sb.append("--- RESUMEN GENERAL ---\n");
        sb.append("Métrica,Valor\n");
        sb.append("Período Desde,").append(desde.format(FORMATO_FECHA_CSV)).append("\n");
        sb.append("Período Hasta,").append(hasta.format(FORMATO_FECHA_CSV)).append("\n");
        sb.append("Ventas Totales,").append(moneda(reporte.getVentasTotales())).append("\n");
        sb.append("Costo Total,").append(moneda(reporte.getCostoTotal())).append("\n");
        sb.append("Ganancia Neta,").append(moneda(reporte.getGananciaNeta())).append("\n");
        sb.append("Cantidad de Ventas,").append(reporte.getCantidadVentas()).append("\n");
        sb.append("Productos Vendidos Totales,").append(reporte.getProductosVendidos()).append("\n\n");

        sb.append("--- DESGLOSE DE PRODUCTOS VENDIDOS ---\n");
        agregarProductos(sb, productosVendidos);

        sb.append("\n--- TOP ").append(Math.max(1, limite)).append(" PRODUCTOS MÁS VENDIDOS ---\n");
        agregarProductos(sb, topProductos);

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void agregarProductos(StringBuilder sb, List<TopProductoDTO> productos) {
        sb.append("ID,Producto,Marca,Cantidad Vendida,Total Ventas,Ganancia Generada\n");
        for (TopProductoDTO producto : productos) {
            sb.append(producto.getProductoId()).append(',')
                    .append(csv(producto.getNombre())).append(',')
                    .append(csv(producto.getMarca())).append(',')
                    .append(producto.getCantidadVendida()).append(',')
                    .append(moneda(producto.getTotalVentas())).append(',')
                    .append(moneda(producto.getGananciaGenerada())).append('\n');
        }
    }

    private String moneda(BigDecimal valor) {
        return String.format(Locale.US, "$%.2f", valor);
    }

    private String csv(String valor) {
        if (valor == null) return "";
        return "\"" + valor.replace("\"", "\"\"") + "\"";
    }
}
