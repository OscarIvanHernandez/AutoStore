package com.padawan.spring.systems.autostore_sys_web.repository.specs;

import java.util.ArrayList;
import java.util.List;


import org.springframework.data.jpa.domain.Specification;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;

import jakarta.persistence.criteria.Predicate;

public class ClienteSpecification {

    public static Specification<Cliente> conFiltros(String q, String telefono, String direccion, String estado) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Búsqueda global por texto
            if (q != null && !q.trim().isEmpty()) {
                String pattern = "%" + q.toLowerCase().trim() + "%";
                Predicate nombreMatch = cb.like(cb.lower(root.get("nombre")), pattern);
                Predicate marcaMatch = cb.like(cb.lower(root.get("telefono")), pattern);
                Predicate categoriaMatch = cb.like(cb.lower(root.get("direccion")), pattern);
                predicates.add(cb.or(nombreMatch, marcaMatch, categoriaMatch));
            };
            // Filtro opcional por telefono
            if (telefono != null && !telefono.trim().isEmpty()) {
                String telefonoPattern = "%" + telefono.toLowerCase().trim()+"%";
                predicates.add(cb.like(cb.lower(root.get("telefono")), telefonoPattern));
            };
            // Filtro opcional por direccion
            if (direccion != null && !direccion.trim().isEmpty()) {
                String direccionPattern = "%" + direccion.toLowerCase().trim()+"%";
                predicates.add(cb.like(cb.lower(root.get("direccion")), direccionPattern));
            };
            // Filtro por estado activo/inactivo
            if (estado != null && !estado.trim().isEmpty()) {
                String estadoValor = estado.trim().toLowerCase();
                if (estadoValor.equals("activo") || estadoValor.equals("true") || estadoValor.equals("1")) {
                    predicates.add(cb.equal(root.get("activo"), true));
                } else if (estadoValor.equals("inactivo") || estadoValor.equals("false") || estadoValor.equals("0")) {
                    predicates.add(cb.equal(root.get("activo"), false));
                };
                // Si mandan algo distinto (como "todos"), simplemente no agregamos filtro y traerá ambos
            };
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    };
};
