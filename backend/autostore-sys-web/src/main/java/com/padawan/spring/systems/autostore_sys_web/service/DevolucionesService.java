package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.DetalleDevolucion;
import com.padawan.spring.systems.autostore_sys_web.model.DetalleVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Devoluciones;
import com.padawan.spring.systems.autostore_sys_web.model.DevolucionesDTO;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.DevolucionesRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

import jakarta.transaction.Transactional;

@Service 
public class DevolucionesService {

    @Autowired
    private DevolucionesRepository devolucionRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional 
    public Devoluciones registrarDevoluciones(DevolucionesDTO request) {
        // 1. Validar motivo obligatorio
        if (request.getMotivo() == null || request.getMotivo().trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de la devolución es obligatorio.");
        }

        // 2. Validar que la venta existe
        Venta venta = ventaRepository.findById(request.getVentaId())
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + request.getVentaId()));

        if (venta.getEstado() == EstadoVenta.CANCELADA) {
            throw new IllegalStateException("No se pueden realizar devoluciones de una venta cancelada.");
        }

        if (venta.getEstado() == EstadoVenta.DEVOLUCION_TOTAL) {
            throw new IllegalStateException("La venta ya fue devuelta por completo.");
        }

        Devoluciones devolucion = new Devoluciones();
        devolucion.setVenta(venta);
        devolucion.setMotivo(request.getMotivo().trim());

        BigDecimal acumuladoReembolso = BigDecimal.ZERO;
        int totalUnidadesOriginales = venta.getDetalles().stream()
            .mapToInt(DetalleVenta::getCantidad)
            .sum();
        int totalUnidadesDevueltasAcumuladas = venta.getDetalles().stream()
            .mapToInt(detalle -> devolucionRepository.obtenerCantidadYaDevuelta(venta.getId(), detalle.getProducto().getId()))
            .sum();

        for (DevolucionesDTO.ItemDevolucion item : request.getProductos()) {
            if (item.getCantidad() <= 0) continue;

            // Buscar el detalle original de la venta
            DetalleVenta detalleOriginal = venta.getDetalles().stream()
                    .filter(dv -> dv.getProducto().getId().equals(item.getProductoId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("El producto con ID " + item.getProductoId() + " no pertenece a esta venta."));

            // 3. Validar que la cantidad a devolver no supere lo disponible
            Integer devueltoPrevio = devolucionRepository.obtenerCantidadYaDevuelta(venta.getId(), item.getProductoId());
            int disponibleParaDevolver = detalleOriginal.getCantidad() - devueltoPrevio;

            if (item.getCantidad() > disponibleParaDevolver) {
                throw new IllegalArgumentException("No se puede devolver " + item.getCantidad() + " unidades del producto '" 
                        + detalleOriginal.getProducto().getNombre() + "'. Máximo disponible a devolver: " + disponibleParaDevolver);
            }

            BigDecimal montoItem = detalleOriginal.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleDevolucion detalleDev = new DetalleDevolucion();
            detalleDev.setDevolucion(devolucion);
            detalleDev.setProducto(detalleOriginal.getProducto());
            detalleDev.setCantidad(item.getCantidad());
            detalleDev.setMontoReembolso(montoItem);

            devolucion.getDetalles().add(detalleDev);
            acumuladoReembolso = acumuladoReembolso.add(montoItem);
            totalUnidadesDevueltasAcumuladas += item.getCantidad();

            // 4. Incrementar stock del producto devuelto
            Producto producto = detalleOriginal.getProducto();
            producto.setStockActual(producto.getStockActual() + item.getCantidad());
            productoRepository.save(producto);
        }

        if (devolucion.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar al menos un producto con cantidad válida a devolver.");
        }

        devolucion.setTotalReembolso(acumuladoReembolso);

        // 5. Ajustar saldo de cliente si fue venta a crédito
        if (venta.getTipoVenta() == TipoVenta.CREDITO && venta.getCliente() != null) {
            Cliente cliente = venta.getCliente();
            BigDecimal nuevaDeuda = cliente.getDeudaActual().subtract(acumuladoReembolso);
            cliente.setDeudaActual(nuevaDeuda.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : nuevaDeuda);
            clienteRepository.save(cliente);
        }

if (totalUnidadesDevueltasAcumuladas >= totalUnidadesOriginales) {
            venta.setEstado(EstadoVenta.DEVOLUCION_TOTAL);
        } else {
            venta.setEstado(EstadoVenta.DEVOLUCION_PARCIAL);
        }
        ventaRepository.save(venta);

        return devolucionRepository.save(devolucion);
    }

    public List<Devoluciones> listarDevoluciones() {
        return devolucionRepository.findAllByOrderByFechaDesc();
    }

    public Devoluciones obtenerPorId(Long id) {
        return devolucionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devolución no encontrada con ID: " + id));
    }
}
