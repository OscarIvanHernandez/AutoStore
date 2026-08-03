package com.padawan.spring.systems.autostore_sys_web.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.repository.DetalleVentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    public VentaService(VentaRepository ventaRepository, DetalleVentaRepository detalleVentaRepository) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
    }

    //Guardar o actualizar
    public Venta guardarVenta(List<Producto> prodcutos) {
        Venta venta = new Venta();

        // Vincular productos
        return ventaRepository.save(venta);
    }
}
