package com.padawan.spring.systems.autostore_sys_web.repository.specs;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.util.Predicates;

import java.util.ArrayList;
import java.util.List;

public class ProductoSpecification {

    public static Specification<Producto> conFiltros(String q, String categoria, String estado){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Búsqueda global por texto
            if (q != null && !q.trim().isEmpty()) {
                String pattern = "%" + q.toLowerCase().trim() + "%";
                Predicate nombreMatch = cb.like(cb.lower(root.get("nombre")), pattern);
                Predicate marcaMatch = cb.like(cb.lower(root.get("marca")), pattern);
                Predicate categoriaMatch = cb.like(cb.lower(root.get("categoria")), categoria);
                predicates.add(cb.or(nombreMatch, marcaMatch, categoriaMatch));
            }
            // Filtro opcional por categoría
            if (categoria != null && !categoria.trim().isEmpty()) {
                String categoriaPattern = "%" + categoria.toLowerCase().trim()+"%";
                predicates.add(cb.like(cb.lower(root.get("categoria")), categoriaPattern));
            }
            // Filtro por estado activo/inactivo
            if (estado != null && !estado.trim().isEmpty()) {
                if (estado.trim().equalsIgnoreCase("activo")) {
                    predicates.add(cb.equal(root.get("activo"), true));   
                } else if (estado.trim().equalsIgnoreCase("inactivo")) {
                    predicates.add(cb.equal(root.get("activo"), false));
                }
            // Si mandan algo distinto (como "todos"), simplemente no agregamos filtro y traerá ambos
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
