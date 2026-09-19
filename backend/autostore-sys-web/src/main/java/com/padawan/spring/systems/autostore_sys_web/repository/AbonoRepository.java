package com.padawan.spring.systems.autostore_sys_web.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.Abono;

@Repository 
public interface AbonoRepository extends JpaRepository<Abono, Long> {

    List<Abono> findByClienteIdOrderByFechaDesc(Long clienteId);

    @Query("SELECT COALESCE(SUM(a.monto), 0) FROM Abono a WHERE a.fecha >= :fechaApertura")
    BigDecimal sumarAbonosDesde(@Param("fechaApertura") LocalDateTime fechaApertura);
}
