package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data 
public class CompraDistribuidorDTO {

    private Long distribuidorId;
    private String folio; // Opcional
    private List<ItemCompra> productos;

    @Data 
    public static class ItemCompra {
        private Long productoId;
        private Integer cantidad;
        private BigDecimal precioUnitarioCompra;
    }
}
