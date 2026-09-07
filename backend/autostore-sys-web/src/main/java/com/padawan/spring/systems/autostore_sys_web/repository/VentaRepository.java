package com.padawan.spring.systems.autostore_sys_web.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long>, JpaSpecificationExecutor<Venta>{

    List<Venta> findByFechaVentaBetween(LocalDateTime inicio, LocalDateTime fin);

    // Consulta para obtener (año, mes) con ventas existentes
    @Query("SELECT DISTINCT YEAR(v.fechaVenta) as anio, MONTH(v.fechaVenta) as mes FROM Venta v ORDER BY anio DESC, mes DESC")
    List<Object[]> findMesesConVentas();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v " +
        "WHERE v.estado = :estado " +
        "AND v.tipoVenta = :tipoVenta " +
        "AND v.fechaVenta >= :fechaApertura")
    BigDecimal sumarVentasContadoDesde(
        @Param("estado") EstadoVenta estado,
        @Param("tipoVenta") TipoVenta tipoVenta,
        @Param("fechaApertura") LocalDateTime fechaApertura
    );

    @Query("SELECT COALESCE(SUM(v.efectivoRecibido), 0) FROM Venta v " +
        "WHERE v.estado = :estado " +
        "AND v.tipoVenta = :tipoVenta " +
        "AND v.fechaVenta >= :fechaApertura")
    BigDecimal sumarEfectivoRecibidoDesde(
        @Param("estado") EstadoVenta estado,
        @Param("tipoVenta") TipoVenta tipoVenta,
        @Param("fechaApertura") LocalDateTime fechaApertura
    );
}
