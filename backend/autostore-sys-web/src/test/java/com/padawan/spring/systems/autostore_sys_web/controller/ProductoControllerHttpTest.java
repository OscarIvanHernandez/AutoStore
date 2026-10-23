package com.padawan.spring.systems.autostore_sys_web.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.service.ProductoService;

@WebMvcTest(ProductoController.class)
class ProductoControllerHttpTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoService productoService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("Debe responder 400 y no guardar un producto inválido")
    void crear_ProductoInvalido() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "nombre": " ",
                                "categoria": null,
                                "marca": null,
                                "precioCompra": 0,
                                "precioVentaMostrador": 0
                            }
                            """))
                .andExpect(status().isBadRequest());

        verify(productoService, never()).guardar(any(Producto.class));
    };

    @Test
    @DisplayName("Debe aceptar el parámetro activo en la ruta de búsqueda")
    void buscar_ConParametroActivo() throws Exception {
        when(productoService.buscarConEspecificacion(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/productos/search")
                        .param("activo", "true"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(productoService).buscarConEspecificacion(any());
    };
};
