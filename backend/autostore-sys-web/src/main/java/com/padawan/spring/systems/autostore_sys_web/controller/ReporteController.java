package com.padawan.spring.systems.autostore_sys_web.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.padawan.spring.systems.autostore_sys_web.model.ReporteGananciasDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TopProductoDTO;
import com.padawan.spring.systems.autostore_sys_web.service.ReporteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping ("/api/reportes")
@CrossOrigin (origins = "http://localhost:4200")
public class ReporteController {

    @Autowired 
    private ReporteService reporteService;

    @GetMapping("/ganancias")
    public ResponseEntity<ReporteGananciasDTO> obtenerGanancias(
        @RequestParam @DateTimeFormat (iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @RequestParam @DateTimeFormat (iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.obtenerGanancias(desde, hasta));
    }
    
    @GetMapping("/top-productos")
    public ResponseEntity<List<TopProductoDTO>> obtenerTopProductos(
        @RequestParam @DateTimeFormat (iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @RequestParam @DateTimeFormat (iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
        @RequestParam (defaultValue = "10") int limite) {
        return ResponseEntity.ok(reporteService.obtenerTopProductos(desde, hasta, limite));
    }
    
    @GetMapping("/ganancias/csv")
    public ResponseEntity<byte[]> descargarCsvGanancias(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "10") int limite) {
        
        byte[] csvBytes = reporteService.generarCsvGanancias(desde, hasta, limite);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-ganancias.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
    
}
