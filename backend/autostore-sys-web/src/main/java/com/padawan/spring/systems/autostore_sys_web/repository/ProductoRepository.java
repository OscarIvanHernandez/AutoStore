package com.padawan.spring.systems.autostore_sys_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;

import java.util.List;

// Repositorio para la entidad Producto, extendiendo JpaRepository para operaciones CRUD y consultas personalizadas
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Productos que no han sufrido eliminación lógica
    List<Producto> findByActivoTrue(); // Productos activos

    // Query personalizada para buscar por término ignorando mayúsculas/minúsculas (ISSUE-02)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
        "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        " LOWER(p.marca) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        " LOWER(p.categoria) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Producto> searchProductos(@Param("q") String query);
}