package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.model.VentaRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.specs.VentaSpecification;
import com.padawan.spring.systems.autostore_sys_web.service.VentaService;

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

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> manejarReglaDeNegocio(IllegalStateException exception) {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", exception.getMessage());
        return ResponseEntity.badRequest().body(respuesta);
    }
    
    // GET /api/ventas[cite: 1]
    @GetMapping
    public ResponseEntity<List<Venta>> listarVentas() {
        return ResponseEntity.ok(ventaService.obtenerTodas());
    }

    // GET /api/ventas/{id}[cite: 1]
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerVentaPorId(@PathVariable Long id) {
        return ventaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/ventas/hoy[cite: 1]
    @GetMapping("/hoy")
    public ResponseEntity<List<Venta>> obtenerVentasDeHoy() {
        return ResponseEntity.ok(ventaService.obtenerVentasDelDia());
    }

    // PUT /api/ventas/{id}/cancelar[cite: 1]
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Venta> cancelarVenta(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.cancelarVenta(id));
    }

    // GET /api/ventas/search
    @GetMapping("/search")
    public ResponseEntity<List<Venta>> buscarVentas(
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String q) {

        Specification<Venta> spec = VentaSpecification.filtrar(clienteId, mes, anio, q);
        List<Venta> resultados = ventaService.buscarConEspecificacion(spec);
        return ResponseEntity.ok(resultados);
    }

    // GET /api/ventas/meses-disponibles
    @GetMapping("/meses-disponibles")
    public ResponseEntity<List<Map<String, Integer>>> obtenerMesesDisponibles() {
        return ResponseEntity.ok(ventaService.obtenerMesesDisponibles());
    }
    

}
