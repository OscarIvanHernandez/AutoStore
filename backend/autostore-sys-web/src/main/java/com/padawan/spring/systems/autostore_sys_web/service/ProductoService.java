package com.padawan.spring.systems.autostore_sys_web.service;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    // Constructor para inyectar el repositorio de productos
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
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
}
