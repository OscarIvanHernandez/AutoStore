package com.padawan.spring.systems.autostore_sys_web.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.padawan.spring.systems.autostore_sys_web.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long>, JpaSpecificationExecutor<Venta>{

    List<Venta> findByFechaVentaBetween(LocalDateTime inicio, LocalDateTime fin);

}
