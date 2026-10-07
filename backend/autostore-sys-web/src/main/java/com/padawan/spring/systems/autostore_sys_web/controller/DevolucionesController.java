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

import com.padawan.spring.systems.autostore_sys_web.model.Devoluciones;
import com.padawan.spring.systems.autostore_sys_web.model.DevolucionesDTO;
import com.padawan.spring.systems.autostore_sys_web.service.DevolucionesService;

@RestController
@RequestMapping ("/api/devoluciones")
@CrossOrigin (origins = "http://localhost:4200")
public class DevolucionesController {
    
    @Autowired
    private DevolucionesService devolucionService;

    @PostMapping
    public ResponseEntity<Devoluciones> crearDevolucion(@RequestBody DevolucionesDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(devolucionService.registrarDevoluciones(request));
    };

    @GetMapping
    public ResponseEntity<List<Devoluciones>> listarDevoluciones() {
        return ResponseEntity.ok(devolucionService.listarDevoluciones());
    };

    @GetMapping("/{id}")
    public ResponseEntity<Devoluciones> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(devolucionService.obtenerPorId(id));
    };
};
