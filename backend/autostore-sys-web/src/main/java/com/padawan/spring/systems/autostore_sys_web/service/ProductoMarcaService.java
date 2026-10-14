package com.padawan.spring.systems.autostore_sys_web.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoMarcaRepository;

import jakarta.transaction.Transactional;

@Service 
public class ProductoMarcaService {

    private final ProductoMarcaRepository marcaRepository;

    public ProductoMarcaService(ProductoMarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    };

    public List<ProductoMarca> obtenerTodas() {
        return marcaRepository.findAll();
    };

    public List<ProductoMarca> obtenerActivas() {
        return marcaRepository.findByActivo(true);
    };

    public ProductoMarca obtenerPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con ID: " + id));
    };

    @Transactional
    public ProductoMarca guardar(ProductoMarca marca) {
        return marcaRepository.save(marca);
    };

    @Transactional 
    public ProductoMarca actualizar(Long id, ProductoMarca marcaDetalles) {
        ProductoMarca marca = obtenerPorId(id);
        marca.setNombre(marcaDetalles.getNombre());
        if (marcaDetalles.getActivo() != null) {
            marca.setActivo(marcaDetalles.getActivo());
        };
        return marcaRepository.save(marca);
    };

    @Transactional
    public void desactivar(Long id) {
        ProductoMarca marca = obtenerPorId(id);
        marca.setActivo(false);
        marcaRepository.save(marca);
    };
};
