package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.DetalleVenta;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoVentaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.model.VentaRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.DetalleVentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

import jakarta.transaction.Transactional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Venta crearVenta(VentaRequestDTO request) {
        // 1. Validar si es a crédito que traiga clienteId[cite: 1]
        if (request.getProductos() == null || request.getProductos().isEmpty()) {
            throw new IllegalArgumentException("La venta debe incluir al menos un producto");
        }

        TipoVenta tipoVenta = TipoVenta.valueOf(request.getTipoVenta().toUpperCase());
        if (tipoVenta == TipoVenta.CREDITO && request.getClienteId() == null) {
            throw new IllegalArgumentException("Las ventas a crédito requieren seleccionar un cliente");
        }
        
        // 2. Crear la entidad Venta e iterar sobre los productos recibidos
        Venta venta = new Venta();
        venta.setFechaVenta(LocalDateTime.now());
        venta.setTipoVenta(tipoVenta);
        venta.setClienteId(request.getClienteId());
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setMetodoPago("EFECTIVO");

        BigDecimal descuento = request.getDescuento() != null ? 
            request.getDescuento() : BigDecimal.ZERO;
        venta.setDescuento(descuento);

        BigDecimal subtotalGeneral = BigDecimal.ZERO;
        
        // 3. Por cada producto: 
        //    - Buscar el producto en BD.
        //    - Verificar que haya stock suficiente.
        //    - Descontar el stock[cite: 1].
        //    - Crear el DetalleVenta calculando cantidad * precioUnitario[cite: 1].
        for (ProductoVentaDTO item: request.getProductos()){
            // Buscar productos en BD
            Producto producto = productoRepository.findById(item.getProductoId())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductoId()));

            // Validar stock disponible
            if (producto.getStockActual() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }
            producto.setStockActual(producto.getStockActual() - item.getCantidad());
            productoRepository.save(producto);

            // Determinar precio segun el tipo "MOSTRADO"/"TALLER"
            BigDecimal precioAplicado = "TALLER".equalsIgnoreCase(item.getPrecioTipo())
                ? producto.getPrecioVentaTaller()
                : producto.getPrecioVentaMostrador();
            
            // Crear detalles, congelando el precio actual
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioAplicado);

            BigDecimal subtotalDetalle = precioAplicado.multiply(BigDecimal.valueOf(item.getCantidad()));
            detalle.setSubtotal(subtotalDetalle);

            // Agregar a la lista de detalles de la venta
            venta.getDetalles().add(detalle);

            // Acumular subtotal general
            subtotalGeneral = subtotalGeneral.add(subtotalDetalle);
        }   
        // 4. Guardar la venta (Spring Data JPA guardará los detalles en cascada automáticamente gracias al CascadeType.ALL).
        venta.setSubtotal(subtotalGeneral);

        BigDecimal totalFinal = subtotalGeneral.subtract(descuento);

        venta.setTotal(totalFinal.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : totalFinal);

        return ventaRepository.save(venta);
    }

}
