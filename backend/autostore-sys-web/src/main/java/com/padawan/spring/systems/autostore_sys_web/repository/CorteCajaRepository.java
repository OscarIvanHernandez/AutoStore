package com.padawan.spring.systems.autostore_sys_web.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.padawan.spring.systems.autostore_sys_web.model.CorteCaja;

public interface CorteCajaRepository extends JpaRepository<CorteCaja, Long> {
    Optional<CorteCaja> findByActivoTrue();
    boolean existsByActivoTrue();
    List<CorteCaja> findAllByOrderByFechaAperturaDesc();
}
