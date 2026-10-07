package com.padawan.spring.systems.autostore_sys_web.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.Devoluciones;

@Repository 
public interface DevolucionesRepository extends JpaRepository<Devoluciones, Long>{

    List<Devoluciones> findAllByOrderByFechaDesc();

    @Query("SELECT COALESCE(SUM(dd.cantidad), 0) FROM DetalleDevolucion dd " +
        "WHERE dd.devolucion.venta.id = :ventaId AND dd.producto.id = :productoId")
    Integer obtenerCantidadYaDevuelta(@Param("ventaId") Long ventaId, @Param("productoId") Long productoId);
};
