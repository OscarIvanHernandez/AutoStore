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

import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.service.ProductoCategoriaService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping ("/api/categorias")
@CrossOrigin (origins = "http://localhost:4200")
public class ProductoCategoriaController {
    
    private final ProductoCategoriaService categoriaService;

    public ProductoCategoriaController(ProductoCategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    };

    @GetMapping
    public ResponseEntity<List<ProductoCategoria>> obtenerTodas(@RequestParam(defaultValue = "true") boolean soloActivas) {
        List<ProductoCategoria> categorias = soloActivas ? categoriaService.obtenerActivas() : categoriaService.obtenerTodas();
        return ResponseEntity.ok(categorias);
    };

    @GetMapping("/{id}")
    public ResponseEntity<ProductoCategoria> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obtenerPorId(id));
    };

    @PostMapping
    public ResponseEntity<ProductoCategoria> crear(@Valid @RequestBody ProductoCategoria categoria) {
        ProductoCategoria nuevaCategoria = categoriaService.guardar(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
    };

    @PutMapping("/{id}")
    public ResponseEntity<ProductoCategoria> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoCategoria categoria) {
        ProductoCategoria categoriaActualizada = categoriaService.actualizar(id, categoria);
        return ResponseEntity.ok(categoriaActualizada);
    };

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        categoriaService.desactivar(id);
        return ResponseEntity.noContent().build();
    };
};
