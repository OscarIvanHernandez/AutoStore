package com.padawan.spring.systems.autostore_sys_web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.service.ProductoService;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    @Mock
    private ProductoService productoService;

    private ProductoController productoController;

    @BeforeEach
    void setUp() {
        productoController = new ProductoController(productoService);
    };

    private Producto crearProducto(Long id, String nombre) {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setId(1L);
        categoria.setNombre("Filtros");

        ProductoMarca marca = new ProductoMarca();
        marca.setId(1L);
        marca.setNombre("Gonher");

        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setMarca(marca);
        producto.setPrecioCompra(new BigDecimal("80.00"));
        producto.setPrecioVentaMostrador(new BigDecimal("120.00"));
        producto.setPrecioVentaTaller(BigDecimal.ZERO);
        producto.setStockActual(15);
        producto.setStockMinimo(5);
        producto.setActivo(true);
        return producto;
    };

    // ==========================
    // 🧹 Editar Producto
    // ==========================
    @Test
    @DisplayName("Debe actualizar un producto existente")
    void update_ProductoExistente() {
        Producto productoExistente = crearProducto(1L, "Filtro viejo");
        productoExistente.setStockActual(15);
        productoExistente.setActivo(true);
        productoExistente.setFoto("foto-anterior.jpg");

        Producto cambios = crearProducto(2L, "Filtro nuevo");
        cambios.setProveedor("Proveedor nuevo");
        cambios.setPrecioCompra(new BigDecimal("90.00"));
        cambios.setPrecioVentaMostrador(new BigDecimal("140.00"));
        cambios.setPrecioVentaTaller(new BigDecimal("110.00"));
        cambios.setStockMinimo(8);
        cambios.setStockActual(999);
        cambios.setActivo(false);
        cambios.setFoto("foto-nueva.jpg");

        when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(productoExistente));
        when(productoService.guardar(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Producto> respuesta = productoController.update(1L, cambios);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isSameAs(productoExistente);
        assertThat(productoExistente.getId()).isEqualTo(1L);
        assertThat(productoExistente.getNombre()).isEqualTo("Filtro nuevo");
        assertThat(productoExistente.getMarca()).isSameAs(cambios.getMarca());
        assertThat(productoExistente.getCategoria()).isSameAs(cambios.getCategoria());
        assertThat(productoExistente.getProveedor()).isEqualTo("Proveedor nuevo");
        assertThat(productoExistente.getPrecioCompra()).isEqualByComparingTo("90.00");
        assertThat(productoExistente.getPrecioVentaMostrador()).isEqualByComparingTo("140.00");
        assertThat(productoExistente.getPrecioVentaTaller()).isEqualByComparingTo("110.00");
        assertThat(productoExistente.getStockMinimo()).isEqualTo(8);

        // La edición solo cambia los campos permitidos; stock, estado y foto se conservan.
        assertThat(productoExistente.getStockActual()).isEqualTo(15);
        assertThat(productoExistente.getActivo()).isTrue();
        assertThat(productoExistente.getFoto()).isEqualTo("foto-anterior.jpg");

        ArgumentCaptor<Producto> productoCaptor = ArgumentCaptor.forClass(Producto.class);
        verify(productoService).guardar(productoCaptor.capture());
        assertThat(productoCaptor.getValue()).isSameAs(productoExistente);
    };

    @Test
    @DisplayName("Debe responder 404 al actualizar un producto inexistente")
    void update_ProductoInexistente() {
        Producto cambios = crearProducto(1L, "Filtro nuevo");
        when(productoService.obtenerPorId(99L)).thenReturn(Optional.empty());

        ResponseEntity<Producto> respuesta = productoController.update(99L, cambios);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(respuesta.getBody()).isNull();
        verify(productoService, never()).guardar(any(Producto.class));
    };

    // ==========================
    // 🧹 Consultar / Buscar ID
    // ==========================
    @Test 
    @DisplayName("Debe responder con 200 al consultar por ID valido")
    void consultar_ProductoExistente() {
        Producto productoExistente = crearProducto(1L, "Filtro viejo");
        productoExistente.setStockActual(15);
        productoExistente.setActivo(true);

        when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(productoExistente));

        ResponseEntity<Producto> respuesta = productoController.getById(1L);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isSameAs(productoExistente);
        assertThat(productoExistente.getId()).isEqualTo(1L);
    };

    @Test 
    @DisplayName("Debe responder con 400 al consultar por ID invalido")
    void consultar_ProductoInxistente() {
        Producto productoExistente = crearProducto(1L, "Filtro viejo");
        productoExistente.setStockActual(15);
        productoExistente.setActivo(true);

        when(productoService.obtenerPorId(10L)).thenReturn(Optional.empty());

        ResponseEntity<Producto> respuesta = productoController.getById(10L);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(respuesta.getBody()).isNull();
    };
};
