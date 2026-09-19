package com.padawan.spring.systems.autostore_sys_web.controller;

import com.padawan.spring.systems.autostore_sys_web.model.Abono;
import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // ISSUE-15: Endpoints CRUD
    @GetMapping
    public ResponseEntity<List<Cliente>> listar(@RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(clienteService.listarClientes(buscar));
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Cliente>> listarActivos(@RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(clienteService.listarClientesActivos(buscar));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Cliente> crear(@RequestBody Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crearCliente(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.actualizarCliente(id, cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarLogico(@PathVariable Long id) {
        clienteService.cambiarEstadoActivo(id, false);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivar")
    public ResponseEntity<Void> reactivarCliente(@PathVariable Long id) {
        clienteService.cambiarEstadoActivo(id, true);
        return ResponseEntity.noContent().build();
    }

    // ISSUE-17: Endpoints de Abonos
    @PostMapping("/{id}/abonos")
    public ResponseEntity<Abono> registrarAbono(@PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {
        BigDecimal monto = request.get("monto");
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.registrarAbono(id, monto));
    }

    @GetMapping("/{id}/abonos")
    public ResponseEntity<List<Abono>> historialAbonos(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerHistorialAbonos(id));
    }

    // ISSUE-18: Endpoints de Deudores
    @GetMapping("/deudores")
    public ResponseEntity<List<Cliente>> listarDeudores() {
        return ResponseEntity.ok(clienteService.obtenerDeudores());
    }

    @GetMapping("/deudores/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasDeudores() {
        return ResponseEntity.ok(clienteService.obtenerEstadisticasDeudores());
    }
}