package com.padawan.spring.systems.autostore_sys_web.repository.specs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;

public class VentaSpecification {

    public static Specification<Venta> filtrar(Long clienteId, Integer mes, Integer anio, TipoVenta tipoVenta, String q) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro por Cliente
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("clienteId"), clienteId));
            };

            // 2. Filtro por Mes y Año (Manejo de fechas)
            if (mes != null && anio != null) {
                LocalDateTime inicioMes = LocalDate.of(anio, mes, 1).atStartOfDay();
                LocalDateTime finMes = LocalDate.of(anio, mes, 1)
                        .plusMonths(1)
                        .minusDays(1)
                        .atTime(23, 59, 59);
                predicates.add(cb.between(root.get("fechaVenta"), inicioMes, finMes));
            };

            // 3. Buscador general (por ID de venta, nombre de cliente o tipo)
            if (q != null && !q.isBlank()) {
                String termino = q.trim();
                String tipoNormalizado = termino.toUpperCase(Locale.ROOT)
                        .replace("É", "E");

                if (tipoNormalizado.equals("CONTADO") || tipoNormalizado.equals("CREDITO")) {
                    predicates.add(cb.equal(
                            root.get("tipoVenta"),
                            TipoVenta.valueOf(tipoNormalizado)));
                } else {
                    List<Predicate> coincidencias = new ArrayList<>();
                    String folio = termino.replaceFirst("(?i)^V\\s*[-#]?\\s*", "");

                    try {
                        Long idBuscado = Long.parseLong(folio);
                        coincidencias.add(cb.equal(root.get("id"), idBuscado));
                    } catch (NumberFormatException ignored) {
                        // El término también puede coincidir con el nombre de un cliente.
                    }

                    String pattern = "%" + termino.toLowerCase(Locale.ROOT) + "%";
                    Join<Venta, Cliente> clienteJoin = root.join("cliente", JoinType.LEFT);
                    coincidencias.add(cb.like(cb.lower(clienteJoin.get("nombre")), pattern));
                    predicates.add(cb.or(coincidencias.toArray(new Predicate[0])));
                }
            };

            if (tipoVenta != null) {
                predicates.add(cb.equal(root.get("tipoVenta"), tipoVenta));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    };
};
