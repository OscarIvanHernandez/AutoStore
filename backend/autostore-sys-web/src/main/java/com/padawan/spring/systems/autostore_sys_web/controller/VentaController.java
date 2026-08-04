package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.model.VentaRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;
import com.padawan.spring.systems.autostore_sys_web.service.VentaService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:4200")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // POST /api/ventas[cite: 1]
    @PostMapping
    public ResponseEntity<Venta> crearVenta(@RequestBody VentaRequestDTO request) {
        return ResponseEntity.ok(ventaService.crearVenta(request));
    }
    
    // GET /api/ventas[cite: 1]
    @GetMapping
    public ResponseEntity<List<Venta>> listarVentas() {
        return ResponseEntity.ok(ventaService.obtenerTodas());
    }

    // GET /api/ventas/{id}[cite: 1]
    //@GetMapping("/{id}")
    //public ResponseEntity<Venta> obtenerVenta(@PathVariable Long id) {
    //    return ResponseEntity.ok(ventaService.obtenerPorId(id));
    //}

    // GET /api/ventas/hoy[cite: 1]
    //@GetMapping("/hoy")
    //public ResponseEntity<List<Venta>> obtenerVentasDeHoy() {
    //    return ResponseEntity.ok(ventaService.obtenerVentasDelDia());
    //}

    // PUT /api/ventas/{id}/cancelar[cite: 1]
    //@PutMapping("/{id}/cancelar")
    //public ResponseEntity<Venta> cancelarVenta(@PathVariable Long id) {
    //    return ResponseEntity.ok(ventaService.cancelarVenta(id));
    //}
    

}
