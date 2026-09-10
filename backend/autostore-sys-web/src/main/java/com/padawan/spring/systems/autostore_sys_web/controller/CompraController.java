package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidor;
import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidorDTO;
import com.padawan.spring.systems.autostore_sys_web.service.CompraDistribuidorService;

@RestController 
@RequestMapping ("/api/compras")
@CrossOrigin (origins = "*")
public class CompraController {
    @Autowired
    private CompraDistribuidorService compraService;

    @PostMapping
    public ResponseEntity<CompraDistribuidor> registrarCompra(@RequestBody CompraDistribuidorDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.registrarCompra(request));
    }

    @GetMapping
    public ResponseEntity<List<CompraDistribuidor>> listarCompras() {
        return ResponseEntity.ok(compraService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraDistribuidor> obtenerCompra(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }
}
