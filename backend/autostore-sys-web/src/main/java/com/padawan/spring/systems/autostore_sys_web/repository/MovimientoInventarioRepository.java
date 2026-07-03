package com.padawan.spring.systems.autostore_sys_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.padawan.spring.systems.autostore_sys_web.model.MovimientoInventario;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    // Hereda automáticamente operaciones básicas para guardar el historial
}
