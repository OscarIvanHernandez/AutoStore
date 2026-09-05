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

    // Búsqueda por nombre o teléfono (ISSUE-15)
    List<Cliente> findByNombreContainingIgnoreCaseOrTelefonoContainingAndActivoTrue(String nombre, String telefono);

    // Listar deudores ordenados de mayor a menor deuda (ISSUE-18)
    List<Cliente> findByDeudaActualGreaterThanAndActivoTrueOrderByDeudaActualDesc(BigDecimal montoMinimo);

    @Query("SELECT SUM(c.deudaActual) FROM Cliente c WHERE c.activo = true AND c.deudaActual > 0")
    BigDecimal sumarTotalDeudas();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND c.deudaActual > 0")
    Long contarClientesDeudores();
}
