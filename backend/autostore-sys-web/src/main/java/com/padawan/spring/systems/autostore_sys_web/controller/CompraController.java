package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidor;
import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidorDTO;
import com.padawan.spring.systems.autostore_sys_web.service.CompraDistribuidorService;

@RestController 
@RequestMapping ("/api/compras")
@CrossOrigin (origins = "http://localhost:4200")
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

    @GetMapping("/filtrar")
    public ResponseEntity<List<CompraDistribuidor>> filtrarCompras(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) Long distribuidorId) {
        return ResponseEntity.ok(compraService.filtrar(inicio, fin, distribuidorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraDistribuidor> obtenerCompra(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }
}
