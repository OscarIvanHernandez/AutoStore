package com.padawan.spring.systems.autostore_sys_web.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.CompraDistribuidor;

@Repository 
public interface CompraDistribuidorRepository extends JpaRepository<CompraDistribuidor, Long>{

    List<CompraDistribuidor> findByDistribuidorIdOrderByFechaDesc(Long distribuidorId);
    List<CompraDistribuidor> findAllByOrderByFechaDesc();
}
