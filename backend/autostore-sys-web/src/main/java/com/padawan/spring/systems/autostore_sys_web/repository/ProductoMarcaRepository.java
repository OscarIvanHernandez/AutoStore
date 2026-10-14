package com.padawan.spring.systems.autostore_sys_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import java.util.List;


@Repository 
public interface ProductoMarcaRepository extends JpaRepository<ProductoMarca, Long> {
    List<ProductoMarca> findByActivo(Boolean activo);
}
