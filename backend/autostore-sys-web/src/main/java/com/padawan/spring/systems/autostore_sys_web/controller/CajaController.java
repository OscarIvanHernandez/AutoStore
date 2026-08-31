package com.padawan.spring.systems.autostore_sys_web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.AperturaCajaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.CierreCajaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.CorteCaja;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoCajaDTO;
import com.padawan.spring.systems.autostore_sys_web.service.CajaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "http://localhost:4200")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @PostMapping("/apertura")
    public ResponseEntity<CorteCaja> abrirCaja(@RequestBody AperturaCajaDTO dto) {
        return ResponseEntity.ok(cajaService.abrirCaja(dto.getEfectivoInicial()));
    }
    @GetMapping("/estado-actual")
    public ResponseEntity<EstadoCajaDTO> obtenerEstadoActual() {
        return ResponseEntity.ok(cajaService.obtenerEstadoActual());
    }

    @PostMapping("/cierre")
    public ResponseEntity<CorteCaja> cerrarCaja(@RequestBody CierreCajaDTO dto) {
        return ResponseEntity.ok(cajaService.cerrarCaja(dto.getEfectivoReal()));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<CorteCaja>> obtenerHistorial() {
        return ResponseEntity.ok(cajaService.obtenerHistorial());
    }
}
