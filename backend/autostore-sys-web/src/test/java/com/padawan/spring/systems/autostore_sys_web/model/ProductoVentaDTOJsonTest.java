package com.padawan.spring.systems.autostore_sys_web.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class ProductoVentaDTOJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldMapProductIdFromJsonPayload() throws Exception {
        String json = "{\"id\":4,\"cantidad\":1,\"precioTipo\":\"MOSTRADOR\"}";

        ProductoVentaDTO dto = objectMapper.readValue(json, ProductoVentaDTO.class);

        assertEquals(4L, dto.getProductoId());
        assertEquals(1, dto.getCantidad());
        assertEquals("MOSTRADOR", dto.getPrecioTipo());
    }
}
