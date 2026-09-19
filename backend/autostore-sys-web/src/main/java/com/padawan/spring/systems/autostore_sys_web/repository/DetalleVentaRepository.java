package com.padawan.spring.systems.autostore_sys_web.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.DetalleVenta;
import com.padawan.spring.systems.autostore_sys_web.model.TopProductoDTO;

@Repository 
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    @Query("SELECT SUM(dv.cantidad * dv.precioUnitario) FROM DetalleVenta dv WHERE dv.venta.fecha BETWEEN :desde AND :hasta")
    BigDecimal sumarVentasTotales(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT SUM(dv.cantidad * dv.precioCompraHistorico) FROM DetalleVenta dv WHERE dv.venta.fecha BETWEEN :desde AND :hasta")
    BigDecimal sumarCostosTotales(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT SUM(dv.cantidad) FROM DetalleVenta dv WHERE dv.venta.fecha BETWEEN :desde AND :hasta")
    Integer sumarProductosVendidos(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT new com.padawan.spring.systems.autostore_sys_web.dto.reportes.TopProductoDTO(" +
        "p.id, p.nombre, p.marca, SUM(dv.cantidad), SUM(dv.cantidad * dv.precioUnitario), " +
        "SUM(dv.cantidad * (dv.precioUnitario - dv.precioCompraHistorico))) " +
        "FROM DetalleVenta dv JOIN dv.producto p " +
        "WHERE dv.venta.fecha BETWEEN :desde AND :hasta " +
        "GROUP BY p.id, p.nombre, p.marca " +
        "ORDER BY SUM(dv.cantidad) DESC, SUM(dv.cantidad * dv.precioUnitario) DESC")
    List<TopProductoDTO> obtenerTopProductos(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta, Pageable pageable);
}
