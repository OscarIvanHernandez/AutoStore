package com.padawan.spring.systems.autostore_sys_web.service;

import com.padawan.spring.systems.autostore_sys_web.model.MovimientoInventario;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.TipoMovimiento;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;

import jakarta.transaction.Transactional;

import com.padawan.spring.systems.autostore_sys_web.repository.MovimientoInventarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    // Constructor para inyectar el repositorio de productos
    public ProductoService(ProductoRepository productoRepository, MovimientoInventarioRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }
    
    // Listar todos los productos activos
    public List<Producto> listarActivos(){
        return productoRepository.findByActivoTrue();
    }

    //Obtener un prodcuto por su ID
    public Optional<Producto> obtenerPorId(Long id){
        return productoRepository.findById(id).filter(Producto::getActivo);

    }

    //Guardar o Actualizar
    public Producto guardar(Producto producto){
        
        // VALIDACIONES -->


        return productoRepository.save(producto);
    }

    // Eliminación lógica (ISSUE-02: activo = false)
    public boolean eliminarLogico(Long id) {
        return productoRepository.findById(id).map(producto -> {
            producto.setActivo(false);
            productoRepository.save(producto);
            return true;
        }).orElse(false);
    }

    // Buscar por nombre, marca o categoría
    public List<Producto> buscar(String criterio) {
        return productoRepository.searchProductos(criterio);
    }

    // Verificar si un producto tiene stock bajo (Criterio de aceptación)
    public boolean esStockBajo(Producto producto) {
        return producto.getStockActual() <= producto.getStockMinimo();
    }

    // Lógica para el ISSUE-07 (Ajuste de Stock)
    @Transactional // Asegura que si algo falla, no se guarde nada (Atomicidad)
    public Producto ajustarStock(Long productoId, TipoMovimiento tipo, Integer cantidad, String motivo) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar y aplicar el cambio de stock
        if (tipo == TipoMovimiento.ENTRADA) {
            producto.setStockActual(producto.getStockActual() + cantidad);
        } else if (tipo == TipoMovimiento.SALIDA) {
            if (producto.getStockActual() < cantidad) {
                throw new IllegalArgumentException("No hay suficiente stock para realizar la salida");
            }
            producto.setStockActual(producto.getStockActual() - cantidad);
        }

        // Guardar el producto actualizado
        Producto productoActualizado = productoRepository.save(producto);

        // Registrar el movimiento en el historial
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(productoActualizado);
        movimiento.setTipoMovimiento(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setFecha(LocalDateTime.now());
        
        movimientoRepository.save(movimiento);

        return productoActualizado;
    }
}
