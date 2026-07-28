package com.padawan.spring.systems.autostore_sys_web.repository.specs;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.util.Predicates;

import java.util.ArrayList;
import java.util.List;

public class ProductoSpecification {

    public static Specification<Producto> conFiltros(String q, String categoria, Boolean activo){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Búsqueda global por texto (Nombre o Marca)
            if (q != null && !q.trim().isEmpty()) {
                String pattern = "%" + q.toLowerCase().trim() + "%";
                Predicate nombreMatch = cb.like(cb.lower(root.get("nombre")), pattern);
                Predicate marcaMatch = cb.like(cb.lower(root.get("marca")), pattern);
                predicates.add(cb.or(nombreMatch, marcaMatch));
            }
            // Filtro opcional por categoría
            if (categoria != null && !categoria.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("categoria"), categoria));
            }
            // Filtro por estado activo/inactivo (si no se envía, trae todos)
            if (activo != null) {
                predicates.add(cb.equal(root.get("activo"), activo));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
