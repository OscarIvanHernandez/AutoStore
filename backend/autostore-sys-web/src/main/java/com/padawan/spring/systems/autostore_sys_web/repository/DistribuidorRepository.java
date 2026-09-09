package com.padawan.spring.systems.autostore_sys_web.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.Distribuidor;

@Repository 
public interface DistribuidorRepository extends JpaRepository<Distribuidor, Long> {

    List<Distribuidor> findByActivoTrue();
    List<Distribuidor> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
}
