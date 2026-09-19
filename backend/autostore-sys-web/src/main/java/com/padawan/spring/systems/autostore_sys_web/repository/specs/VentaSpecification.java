package com.padawan.spring.systems.autostore_sys_web.repository.specs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import com.padawan.spring.systems.autostore_sys_web.model.Venta;

public class VentaSpecification {

    public static Specification<Venta> filtrar(Long clienteId, Integer mes, Integer anio, String q) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro por Cliente
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("clienteId"), clienteId));
            }

            // 2. Filtro por Mes y Año (Manejo de fechas)
            if (mes != null && anio != null) {
                LocalDateTime inicioMes = LocalDate.of(anio, mes, 1).atStartOfDay();
                LocalDateTime finMes = LocalDate.of(anio, mes, 1)
                        .plusMonths(1)
                        .minusDays(1)
                        .atTime(23, 59, 59);

                predicates.add(cb.between(root.get("fechaVenta"), inicioMes, finMes));
            }

            // 3. Buscador general (por ID de venta)
            if (q != null && !q.isBlank()) {
                try {
                    Long idBuscado = Long.parseLong(q.trim());
                    predicates.add(cb.equal(root.get("id"), idBuscado));
                } catch (NumberFormatException e) {
                    // Si 'q' no es número, se ignora o se busca por otro campo String
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
