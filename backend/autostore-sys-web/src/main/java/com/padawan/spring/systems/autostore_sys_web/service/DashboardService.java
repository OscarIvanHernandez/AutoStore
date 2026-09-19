package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.DashboardDTO;
import com.padawan.spring.systems.autostore_sys_web.model.ReporteGananciasDTO;
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

        // 2. Productos con stock bajo
        List<DashboardDTO.ProductoStockBajo> stockBajo = productoRepository.findProductosConStockBajo();

        // 3. Deudores
        Long totalDeudores = clienteRepository.contarClientesDeudores();
        BigDecimal sumaDeudas = clienteRepository.sumarTotalDeudas();
        DashboardDTO.DeudoresResumen deudores = new DashboardDTO.DeudoresResumen(totalDeudores, sumaDeudas);

        // 4. Últimas 5 ventas
        List<DashboardDTO.UltimaVenta> ultimasVentas = ventaRepository.obtenerUltimas5Ventas();

        return new DashboardDTO(gananciasHoy, stockBajo, deudores, ultimasVentas);
    }
}
