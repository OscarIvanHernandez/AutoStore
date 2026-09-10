package com.padawan.spring.systems.autostore_sys_web.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.Distribuidor;
import com.padawan.spring.systems.autostore_sys_web.repository.DistribuidorRepository;

import jakarta.transaction.Transactional;

@Service 
public class DistribuidorService {

    @Autowired
    private DistribuidorRepository distribuidorRepository;

    public List<Distribuidor> listarTodos() {
        return distribuidorRepository.findByActivoTrue();
    }

    public Distribuidor obtenerPorId(Long id) {
        return distribuidorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Distribuidor no encontrado con ID: " + id));
    }

    @Transactional 
    public Distribuidor guardar(Distribuidor distribuidor) {
        distribuidor.setActivo(true);
        return distribuidorRepository.save(distribuidor);
    }

    @Transactional
    public Distribuidor actualizar(Long id, Distribuidor datos) {
        Distribuidor d = obtenerPorId(id);
        d.setNombre(datos.getNombre());
        d.setTelefono(datos.getTelefono());
        d.setContacto(datos.getContacto());
        return distribuidorRepository.save(d);
    }

    @Transactional
    public void desactivar(Long id) {
        Distribuidor d = obtenerPorId(id);
        d.setActivo(false);
        distribuidorRepository.save(d);
    }

    @Transactional 
    public void activar(Long id) {
        Distribuidor d = obtenerPorId(id);
        d.setActivo(true);
        distribuidorRepository.save(d);
    }
}
