package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;
import com.padawan.spring.systems.autostore_sys_web.service.VentaService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:4200")
public class VentaController {

    private final VentaService ventaService;
    
    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }
    
    @PostMapping
    public ResponseEntity<Venta> createVenta(@Valid @RequestBody List<Producto> productos) {
        Venta createdVenta = ventaService.guardarVenta(productos);
        return null;
    }
    

}
