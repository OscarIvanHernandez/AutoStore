package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidor;
import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidorDTO;
import com.padawan.spring.systems.autostore_sys_web.model.DetalleCompraDist;
import com.padawan.spring.systems.autostore_sys_web.model.Distribuidor;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.repository.CompraDistribuidorRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.DistribuidorRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;

import jakarta.transaction.Transactional;

@Service 
public class CompraDistribuidorService {

    @Autowired
    private CompraDistribuidorRepository compraRepository;

    @Autowired
    private DistribuidorRepository distribuidorRepository;

    @Autowired
    private ProductoRepository productoRepository; // Tu repositorio de inventario existente

    @Transactional 
    public CompraDistribuidor registrarCompra(CompraDistribuidorDTO request) {
        validarSolicitud(request);

        Distribuidor distribuidor = distribuidorRepository.findById(request.getDistribuidorId())
                .orElseThrow(() -> new RuntimeException("Distribuidor no encontrado"));

        CompraDistribuidor compra = new CompraDistribuidor();
        compra.setDistribuidor(distribuidor);
        compra.setFolio(request.getFolio());

        BigDecimal acumuladoTotal = BigDecimal.ZERO;

        for (CompraDistribuidorDTO.ItemCompra item : request.getProductos()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductoId()));

            BigDecimal subtotal = item.getPrecioUnitarioCompra().multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleCompraDist detalle = new DetalleCompraDist();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitarioCompra(item.getPrecioUnitarioCompra());
            detalle.setSubtotal(subtotal);

            compra.getDetalles().add(detalle);
            acumuladoTotal = acumuladoTotal.add(subtotal);

            // Incrementar el stock y actualizar el costo base del producto
            int stockActual = producto.getStockActual() == null ? 0 : producto.getStockActual();
            producto.setStockActual(stockActual + item.getCantidad());
            producto.setPrecioCompra(item.getPrecioUnitarioCompra()); // Actualiza el precio de costo al más reciente
            productoRepository.save(producto);
        }

        compra.setTotal(acumuladoTotal);
        return compraRepository.save(compra);
    }

    private void validarSolicitud(CompraDistribuidorDTO request) {
        if (request == null || request.getDistribuidorId() == null) {
            throw new IllegalArgumentException("El distribuidor es obligatorio");
        }
        if (request.getProductos() == null || request.getProductos().isEmpty()) {
            throw new IllegalArgumentException("La compra debe incluir al menos un producto");
        }

        for (CompraDistribuidorDTO.ItemCompra item : request.getProductos()) {
            if (item == null || item.getProductoId() == null) {
                throw new IllegalArgumentException("El producto es obligatorio");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor que cero");
            }
            if (item.getPrecioUnitarioCompra() == null
                    || item.getPrecioUnitarioCompra().signum() <= 0) {
                throw new IllegalArgumentException("El precio unitario debe ser mayor que cero");
            }
        }
    }

    public List<CompraDistribuidor> listarTodas() {
        return compraRepository.findAllByOrderByFechaDesc();
    }

    public List<CompraDistribuidor> filtrar(LocalDate inicio, LocalDate fin, Long distribuidorId) {
        return compraRepository.findAllByOrderByFechaDesc().stream()
                .filter(compra -> inicio == null || !compra.getFecha().toLocalDate().isBefore(inicio))
                .filter(compra -> fin == null || !compra.getFecha().toLocalDate().isAfter(fin))
                .filter(compra -> distribuidorId == null
                        || compra.getDistribuidor().getId().equals(distribuidorId))
                .toList();
    }

    public CompraDistribuidor obtenerPorId(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));
    }
}
