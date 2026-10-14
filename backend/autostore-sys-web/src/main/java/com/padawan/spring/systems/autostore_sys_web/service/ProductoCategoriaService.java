package com.padawan.spring.systems.autostore_sys_web.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoCategoriaRepository;

import jakarta.transaction.Transactional;

@Service 
public class ProductoCategoriaService {
private final ProductoCategoriaRepository productoCategoriaRepository;

    public ProductoCategoriaService(ProductoCategoriaRepository productoCategoriaRepository) {
        this.productoCategoriaRepository = productoCategoriaRepository;
    }

    public List<ProductoCategoria> obtenerTodas() {
        return productoCategoriaRepository.findAll();
    }

    public List<ProductoCategoria> obtenerActivas() {
        return productoCategoriaRepository.findByActivo(true);
    }

    public ProductoCategoria obtenerPorId(Long id) {
        return productoCategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    @Transactional 
    public ProductoCategoria guardar(ProductoCategoria categoria) {
        return productoCategoriaRepository.save(categoria);
    }

    @Transactional
    public ProductoCategoria actualizar(Long id, ProductoCategoria categoriaDetalles) {
        ProductoCategoria categoria = obtenerPorId(id);
        categoria.setNombre(categoriaDetalles.getNombre());
        if (categoriaDetalles.getActivo() != null) {
            categoria.setActivo(categoriaDetalles.getActivo());
        }
        return productoCategoriaRepository.save(categoria);
    }

    @Transactional
    public void desactivar(Long id) {
        ProductoCategoria categoria = obtenerPorId(id);
        categoria.setActivo(false);
        productoCategoriaRepository.save(categoria);
    }
}
