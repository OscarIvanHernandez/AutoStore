package com.padawan.spring.systems.autostore_sys_web.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.Abono;

@Repository 
public interface AbonoRepository extends JpaRepository<Abono, Long> {

    List<Abono> findByClienteIdOrderByFechaDesc(Long clienteId);
}
