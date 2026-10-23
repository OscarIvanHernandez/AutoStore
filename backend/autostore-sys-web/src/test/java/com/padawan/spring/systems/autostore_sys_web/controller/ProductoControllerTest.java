package com.padawan.spring.systems.autostore_sys_web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.padawan.spring.systems.autostore_sys_web.model.AjusteRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.model.TipoMovimiento;
import com.padawan.spring.systems.autostore_sys_web.service.ProductoService;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    @Mock
    private ProductoService productoService;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<?> criteriaQuery;

    @Mock
    private Root<Producto> productoRoot;

    @Mock
    private Path<Object> activoPath;

    @Mock
    private Predicate predicate;

    private ProductoController productoController;

    @BeforeEach
    void setUp() {
        productoController = new ProductoController(productoService);
    };

    private Producto crearProducto(
        Long id, 
        ProductoCategoria categoria, 
        ProductoMarca marca, 
        String nombre) {

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
    // 🧹 listar 
    // ==========================
    @Test 
    @DisplayName ("Debe retornar una lista de todos los productos existentes")
    void obtenerTodos_Productos() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        ProductoCategoria categoria2 = new ProductoCategoria();
        categoria2.setNombre("Transmición");
        ProductoMarca marca2 = new ProductoMarca();
        marca2.setNombre("Motorcraft");

        Producto prod1 = crearProducto(1L, categoria, marca, "GP-01");
        Producto prod2 = crearProducto(2L, categoria, marca, "GP-11");
        Producto prod3 = crearProducto(3L, categoria2, marca2, "Automatica");
        prod3.setActivo(false);

        List<Producto> productos = Arrays.asList(prod1, prod2, prod3);

        when(productoService.listarTodos()).thenReturn(productos);

        List<Producto> respuesta = productoController.getAll();

        assertNotNull(respuesta);
        assertEquals(3, respuesta.size());
        assertEquals("GP-01", respuesta.get(0).getNombre());
        assertEquals("GP-11", respuesta.get(1).getNombre());
        assertEquals("Automatica", respuesta.get(2).getNombre());

        verify(productoService).listarTodos();
    };

    @Test 
    @DisplayName ("Debe retornar una lista de todos los productos activos existentes")
    void obtenerTodos_ProductosActivos() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        ProductoCategoria categoria2 = new ProductoCategoria();
        categoria2.setNombre("Transmición");
        ProductoMarca marca2 = new ProductoMarca();
        marca2.setNombre("Motorcraft");

        Producto prod1 = crearProducto(1L, categoria, marca, "GP-01");
        Producto prod2 = crearProducto(2L, categoria, marca, "GP-11");
        Producto prod3 = crearProducto(3L, categoria2, marca2, "Automatica");
        prod3.setActivo(false);

        List<Producto> productos = Arrays.asList(prod1, prod2);

        when(productoService.listarActivos()).thenReturn(productos);

        List<Producto> respuesta = productoController.getAllActives();

        assertNotNull(respuesta);
        assertEquals(2, respuesta.size());
        assertEquals("GP-01", respuesta.get(0).getNombre());
        assertEquals("GP-11", respuesta.get(1).getNombre());

        verify(productoService).listarActivos();
    };

    // ==========================
    // 🧹 Editar 
    // ==========================
    @Test
    @DisplayName("Debe actualizar un producto existente")
    void update_ProductoExistente() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");
        productoExistente.setStockActual(15);
        productoExistente.setActivo(true);
        productoExistente.setFoto("foto-anterior.jpg");

        Producto cambios = crearProducto(2L, categoria, marca, "Filtro nuevo");
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
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto cambios = crearProducto(1L, categoria, marca, "Filtro nuevo");
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
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");
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
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");
        productoExistente.setStockActual(15);
        productoExistente.setActivo(true);

        when(productoService.obtenerPorId(10L)).thenReturn(Optional.empty());

        ResponseEntity<Producto> respuesta = productoController.getById(10L);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(respuesta.getBody()).isNull();
    };

    // ==========================
    // 🧹 Eliminar
    // ==========================
    @Test 
    @DisplayName ("Debe responder con un 204 al eliminar (lógico) un producto")
    void eliminar_productoExitoso() {
        // El servicio elimino el producto
        when(productoService.eliminarLogico(1L)).thenReturn(true);
        ResponseEntity<Void> respuesta = productoController.delete(1L);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(respuesta.getBody()).isNull();
    };

    @Test
    @DisplayName("Debe responder con un 404 si el producto no existe")
    void eliminar_productoNoExistente() {
        // El servicio no encontró el producto
        when(productoService.eliminarLogico(1L)).thenReturn(false);

        ResponseEntity<Void> respuesta = productoController.delete(1L);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    };

    // ==========================
    // 🧹 Busqueda
    // ==========================
    @Test 
    @DisplayName ("Debe responder con 200 y delegar la búsqueda con filtros")
    void buscar_Productos() {
        String q = "filtro";
        String specMarca = "Gonher";
        String specCategoria = "filtros";
        String estadoFiltro = "activo";

        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");

        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");
        Producto productoExistenteDif = crearProducto(2L, categoria, marca, "Aceite");
        ProductoCategoria categoriaDif = new ProductoCategoria();
        categoriaDif.setId(2L);
        categoriaDif.setNombre("Motor a gasolina");
        productoExistente.setCategoria(categoriaDif);
        when(productoService.buscarConEspecificacion(any()))
                .thenReturn(List.of(productoExistente));

        ResponseEntity<List<Producto>> respuesta =
                productoController.search(q, specMarca, specCategoria, estadoFiltro, null);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).containsExactly(productoExistente);
        assertThat(respuesta.getBody()).doesNotContain(productoExistenteDif);
        verify(productoService).buscarConEspecificacion(any());
    };

    @Test
    @DisplayName("Debe usar el parámetro activo cuando no se especifica estado")
    void buscar_UsaActivoCuandoEstadoNoSeEspecifica() {
        ProductoCategoria categoria = new ProductoCategoria();
        ProductoMarca marca = new ProductoMarca();
        Producto producto = crearProducto(1L, categoria, marca, "Filtro");

        when(productoRoot.get("activo")).thenReturn(activoPath);
        when(criteriaBuilder.equal(activoPath, true)).thenReturn(predicate);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(predicate);
        when(productoService.buscarConEspecificacion(any())).thenAnswer(invocation -> {
            Specification<Producto> specification = invocation.getArgument(0);
            specification.toPredicate(productoRoot, criteriaQuery, criteriaBuilder);
            return List.of(producto);
        });

        ResponseEntity<List<Producto>> respuesta =
                productoController.search(null, null, null, null, "activo");

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).containsExactly(producto);
        verify(criteriaBuilder).equal(activoPath, true);
    };

    @Test
    @DisplayName("El parámetro estado debe tener prioridad sobre activo")
    void buscar_EstadoTienePrioridadSobreActivo() {
        when(productoRoot.get("activo")).thenReturn(activoPath);
        when(criteriaBuilder.equal(activoPath, false)).thenReturn(predicate);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(predicate);
        when(productoService.buscarConEspecificacion(any())).thenAnswer(invocation -> {
            Specification<Producto> specification = invocation.getArgument(0);
            specification.toPredicate(productoRoot, criteriaQuery, criteriaBuilder);
            return List.of();
        });

        ResponseEntity<List<Producto>> respuesta =
                productoController.search(null, null, null, "inactivo", "activo");

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isEmpty();
        verify(criteriaBuilder).equal(activoPath, false);
        verify(criteriaBuilder, never()).equal(activoPath, true);
    };

    // ==========================
    // 🧹 Crear / Cambiar
    // ==========================

    @Test
    @DisplayName ("Debe realizar una peticion POST ante la creacion de producto correctamente")
    void crear_Producto() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");

        when(productoService.guardar(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    
        ResponseEntity<Producto> respuesta = productoController.create(productoExistente);

        // Verificar que el body no sea nulo y tenga los datos correctos
        assertThat(respuesta.getBody()).isNotNull();
        assertThat(respuesta.getBody().getId()).isEqualTo(1L);
        assertThat(respuesta.getBody().getNombre()).isEqualTo("Filtro viejo");

        // Opcional: verificar que se llamó al servicio
        verify(productoService, times(1)).guardar(productoExistente);
    };

    @Test
    @DisplayName ("Debe realizar un cambio de estado de producto correctamente")
    void editarEstado_Producto() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");        
        Producto productoExistente = crearProducto(1L, categoria, marca, "Filtro viejo");
        productoExistente.setActivo(true);

        when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(productoExistente));
        when(productoService.guardar(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Producto> respuesta = productoController.updateState(1L, false);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isSameAs(productoExistente);
        assertThat(respuesta.getBody().getId()).isEqualTo(1L);
        assertThat(respuesta.getBody().getActivo()).isFalse();
        verify(productoService).obtenerPorId(1L);
        verify(productoService).guardar(productoExistente);
    };

    @Test
    @DisplayName("Debe responder 400 al cambiar el estado de un producto inexistente")
    void editarEstado_ProductoInexistente() {
        when(productoService.obtenerPorId(99L)).thenReturn(Optional.empty());

        ResponseEntity<Producto> respuesta = productoController.updateState(99L, false);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(respuesta.getBody()).isNull();
        verify(productoService).obtenerPorId(99L);
        verify(productoService, never()).guardar(any(Producto.class));
    };

    // ==========================
    // 🧹 Ajustar stock
    // ==========================
    @Test 
    @DisplayName ("Debe realizar un ajuste exitoso de stock")
    void ajusteStock_exitoso() {
        AjusteRequestDTO request = new AjusteRequestDTO();
        request.setTipo("ENTRADA");
        request.setCantidad(10);
        request.setMotivo("testing");

        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        Producto prod = crearProducto(1L, categoria, marca, "GP-01");
        
        when(productoService.ajustarStock(1L, TipoMovimiento.ENTRADA, 10, "testing")).thenReturn(prod);

        ResponseEntity<?> respuesta = productoController.ajustarStock(1L, request);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(prod, respuesta.getBody());
        verify(productoService).ajustarStock(
            1L, TipoMovimiento.ENTRADA, 10, "testing");
    };

    @Test 
    @DisplayName ("Debe regresar 400 ante un ajuste cuando tipo es invalido")
    void ajusteStock_InvalidoBadRequest() {
        AjusteRequestDTO request = new AjusteRequestDTO();
        request.setTipo("ALGO");
        request.setCantidad(10);
        request.setMotivo("testing");

        ResponseEntity<?> respuesta = productoController.ajustarStock(1L, request);

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        verify(productoService, never()).ajustarStock(
            any(), any(), any(), any());
    };

    @Test 
    @DisplayName ("Debe regresar un 404 cuando el producto no es encontrado en un ajuste valido")
    void productoNotFound_AjusteStock() {
        AjusteRequestDTO request = new AjusteRequestDTO();
        request.setTipo("SALIDA");
        request.setCantidad(10);
        request.setMotivo("testing");

        when(productoService.ajustarStock(1L, TipoMovimiento.SALIDA, 10, "testing"))
        .thenThrow(new RuntimeException());

        ResponseEntity<?> respuesta = productoController.ajustarStock(1L, request);
        
        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
    };

    @Test
    @DisplayName("Debe responder 400 si el ajuste de salida no tiene stock suficiente")
    void ajusteStock_SinStockSuficiente() {
        AjusteRequestDTO request = new AjusteRequestDTO();
        request.setTipo("SALIDA");
        request.setCantidad(10);
        request.setMotivo("testing");
        when(productoService.ajustarStock(1L, TipoMovimiento.SALIDA, 10, "testing"))
                .thenThrow(new IllegalArgumentException("No hay suficiente stock"));

        ResponseEntity<?> respuesta = productoController.ajustarStock(1L, request);

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertEquals("No hay suficiente stock", respuesta.getBody());
        verify(productoService).ajustarStock(1L, TipoMovimiento.SALIDA, 10, "testing");
    };
    // ==========================
    // 🧹 Busqueda
    // ==========================
};
