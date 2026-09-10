package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.Distribuidor;
import com.padawan.spring.systems.autostore_sys_web.service.DistribuidorService;

@RestController 
@RequestMapping ("/api/distribuidores")
@CrossOrigin (origins = "*")
public class DistribuidorController {  
    @Autowired
    private DistribuidorService distribuidorService;

    @GetMapping
    public ResponseEntity<List<Distribuidor>> listar() {
        return ResponseEntity.ok(distribuidorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Distribuidor> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(distribuidorService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Distribuidor> crear(@RequestBody Distribuidor distribuidor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(distribuidorService.guardar(distribuidor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Distribuidor> actualizar(@PathVariable Long id, @RequestBody Distribuidor distribuidor) {
        return ResponseEntity.ok(distribuidorService.actualizar(id, distribuidor));
    }

    @PutMapping("activar/{id}")
    public ResponseEntity<Void> activar (@PathVariable Long id) {
        distribuidorService.activar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("desactivar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        distribuidorService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

}
