package com.padawan.spring.systems.autostore_sys_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import java.util.List;


@Repository 
public interface ProductoCategoriaRepository extends JpaRepository<ProductoCategoria, Long> {
    List<ProductoCategoria> findByActivo(Boolean activo);
}
