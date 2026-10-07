package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.DashboardDTO;
import com.padawan.spring.systems.autostore_sys_web.model.ReporteGananciasDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TopProductoDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@Service 
public class DashboardService {

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private VentaRepository ventaRepository;

    public DashboardDTO obtenerResumenDashboard() {
        // 1. Métricas de hoy
        LocalDate hoy = LocalDate.now();
        ReporteGananciasDTO gananciasHoyReporte = reporteService.obtenerGanancias(hoy, hoy);
        DashboardDTO.GananciasHoy gananciasHoy = new DashboardDTO.GananciasHoy(
                gananciasHoyReporte.getVentasTotales(),
                gananciasHoyReporte.getGananciaNeta(),
                gananciasHoyReporte.getCantidadVentas()
        );

        // 2. Resumen y productos más vendidos de los últimos 7 días
        LocalDate inicioSemana = hoy.minusDays(6);
        ReporteGananciasDTO ventasSemana = reporteService.obtenerGanancias(inicioSemana, hoy);
        List<TopProductoDTO> topProductos =
            reporteService.obtenerTopProductos(inicioSemana, hoy, 5);

        // 3. Productos con stock bajo
        List<DashboardDTO.ProductoStockBajo> stockBajo = productoRepository.findProductosConStockBajo();

        // 4. Deudores
        Long totalDeudores = clienteRepository.contarClientesDeudores();
        BigDecimal sumaDeudas = clienteRepository.sumarTotalDeudas();
        DashboardDTO.DeudoresResumen deudores = new DashboardDTO.DeudoresResumen(totalDeudores, sumaDeudas);

        // 5. Últimas 5 ventas
        List<DashboardDTO.UltimaVenta> ultimasVentas = ventaRepository.obtenerUltimas5Ventas(PageRequest.of(0, 5));

        return new DashboardDTO(gananciasHoy, stockBajo, deudores, ultimasVentas, ventasSemana, topProductos);
    };
};
