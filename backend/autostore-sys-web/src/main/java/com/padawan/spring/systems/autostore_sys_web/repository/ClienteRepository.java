package com.padawan.spring.systems.autostore_sys_web.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;

@Repository 
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findByActivoTrue();

    List<Cliente> findByNombreContainingIgnoreCaseOrTelefonoContainingIgnoreCase(String nombre, String telefono);

            // Búsqueda por nombre o teléfono entre clientes activos (ISSUE-15)
            @Query("SELECT c FROM Cliente c WHERE c.activo = true AND "
            + "(LOWER(c.nombre) LIKE LOWER(CONCAT('%', :filtro, '%')) "
            + "OR c.telefono LIKE CONCAT('%', :filtro, '%'))")
            List<Cliente> buscarActivos(@org.springframework.data.repository.query.Param("filtro") String filtro);

    // Listar deudores ordenados de mayor a menor deuda (ISSUE-18)
    List<Cliente> findByDeudaActualGreaterThanAndActivoTrueOrderByDeudaActualDesc(BigDecimal montoMinimo);

    @Query("SELECT SUM(c.deudaActual) FROM Cliente c WHERE c.activo = true AND c.deudaActual > 0")
    BigDecimal sumarTotalDeudas();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND c.deudaActual > 0")
    Long contarClientesDeudores();
}
