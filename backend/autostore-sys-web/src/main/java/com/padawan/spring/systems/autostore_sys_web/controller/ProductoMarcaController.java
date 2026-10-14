package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.service.ProductoMarcaService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping ("/api/marcas")
@CrossOrigin (origins = "http://localhost:4200")
public class ProductoMarcaController {
    
    private final ProductoMarcaService marcaService;

    public ProductoMarcaController(ProductoMarcaService marcaService) {
        this.marcaService = marcaService;
    };

    @GetMapping
    public ResponseEntity<List<ProductoMarca>> obtenerTodas(@RequestParam(defaultValue = "true") boolean soloActivas) {
        List<ProductoMarca> marcas = soloActivas ? marcaService.obtenerActivas() : marcaService.obtenerTodas();
        return ResponseEntity.ok(marcas);
    };

    @GetMapping("/{id}")
    public ResponseEntity<ProductoMarca> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(marcaService.obtenerPorId(id));
    };

    @PostMapping
    public ResponseEntity<ProductoMarca> crear(@Valid @RequestBody ProductoMarca marca) {
        ProductoMarca nuevaMarca = marcaService.guardar(marca);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaMarca);
    };

    @PutMapping("/{id}")
    public ResponseEntity<ProductoMarca> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoMarca marca) {
        ProductoMarca marcaActualizada = marcaService.actualizar(id, marca);
        return ResponseEntity.ok(marcaActualizada);
    };

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        marcaService.desactivar(id);
        return ResponseEntity.noContent().build();
    };
};
