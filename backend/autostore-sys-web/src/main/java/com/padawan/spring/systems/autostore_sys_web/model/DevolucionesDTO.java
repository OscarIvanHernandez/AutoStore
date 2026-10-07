package com.padawan.spring.systems.autostore_sys_web.model;

import java.util.List;

import lombok.Data;

@Data 
public class DevolucionesDTO {

    private Long ventaId;
    private String motivo;
    private List<ItemDevolucion> productos;

    @Data
    public static class ItemDevolucion {
        private Long productoId;
        private Integer cantidad;
    };
};
