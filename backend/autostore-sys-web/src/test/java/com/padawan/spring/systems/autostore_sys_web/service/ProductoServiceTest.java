package com.padawan.spring.systems.autostore_sys_web.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import com.padawan.spring.systems.autostore_sys_web.controller.ProductoController;
import com.padawan.spring.systems.autostore_sys_web.model.MovimientoInventario;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.model.TipoMovimiento;
import com.padawan.spring.systems.autostore_sys_web.repository.MovimientoInventarioRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@ExtendWith (MockitoExtension.class)
public class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock 
    private MovimientoInventarioRepository movimientoInventarioRepository;

    private ProductoService productoService;
    private  ProductoController productoController;

    private Producto productoBase;
    private ProductoCategoria categoriaBase;
    private ProductoMarca marcaBase;
    private ValidatorFactory validatorFactory;

    // ==========================
    // 🔧 Setup y configuración
    // ==========================
    @BeforeEach 
    void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        productoService = new ProductoService(
                productoRepository,
                movimientoInventarioRepository,
                validatorFactory.getValidator());

        // Instanciar objetos de catálogo
        categoriaBase = new ProductoCategoria();
        categoriaBase.setId(1L);
        categoriaBase.setNombre("Filtros");

        marcaBase = new ProductoMarca();
        marcaBase.setId(1L);
        marcaBase.setNombre("Gonher");

        productoBase = new Producto();
        productoBase.setId(1L);
        productoBase.setNombre("Filtro de Aceite");
        productoBase.setMarca(marcaBase);
        productoBase.setCategoria(categoriaBase);
        productoBase.setPrecioCompra(new BigDecimal("80.00"));
        productoBase.setPrecioVentaMostrador(new BigDecimal("120.00"));
        productoBase.setPrecioVentaTaller(new BigDecimal("0"));
        productoBase.setStockActual(15);
        productoBase.setStockMinimo(5);
        productoBase.setActivo(true);
    };

    // ==========================
    // 🧹 Limpieza
    // ==========================
    @AfterEach
    void tearDown() {
        validatorFactory.close();
    };

    // ==========================
    // 🧹 Guardar Producto
    // ==========================
    @Test 
    @DisplayName ("Debes guardar un producto nuevo correctamente")
    void guardarProducto_Exito(){
        when(productoRepository.save(any(Producto.class))).thenReturn(productoBase);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));

        Producto respuesta = productoService.guardar(productoBase);
        
        assertThat(respuesta).isNotNull();
        assertThat(respuesta.getId()).isEqualTo(1L);
        assertThat(respuesta.getMarca().getNombre()).isEqualTo("Gonher");
        assertThat(respuesta.getCategoria().getNombre()).isEqualTo("Filtros");
        verify(productoRepository, times(1)).save(productoBase);
        verify(productoRepository, times(1)).findById(1L);
    };

    @Test
    @DisplayName("Debe fallar al guardar producto sin marca")
    void guardarProducto_SinMarca_Falla() {
        // Crear producto sin marca
        Producto productoSinMarca = new Producto();
        productoSinMarca.setId(2L);
        productoSinMarca.setNombre("Filtro de Aire");
        productoSinMarca.setCategoria(categoriaBase);
        productoSinMarca.setPrecioCompra(new BigDecimal("100.00"));
        productoSinMarca.setPrecioVentaMostrador(new BigDecimal("150.00"));
        productoSinMarca.setPrecioVentaTaller(new BigDecimal("0"));
        productoSinMarca.setStockActual(10);
        productoSinMarca.setStockMinimo(3);
        productoSinMarca.setActivo(true);
        productoSinMarca.setMarca(null); // campo obligatorio

        // puede lanzar ConstraintViolationException o RuntimeException
        assertThrows(ConstraintViolationException.class, 
            () -> productoService.guardar(productoSinMarca));
        
        // verificar que nunca se llamó al repositorio
        verify(productoRepository, never()).save(any(Producto.class));
    };

    @Test
    @DisplayName("Debe fallar al guardar producto sin categoria")
    void guardarProducto_SinCategoria_Falla() {
        // Crear producto sin categoria
        Producto productoSinCategoria = new Producto();
        productoSinCategoria.setId(2L);
        productoSinCategoria.setNombre("Filtro de Aire");
        productoSinCategoria.setMarca(marcaBase);
        productoSinCategoria.setPrecioCompra(new BigDecimal("100.00"));
        productoSinCategoria.setPrecioVentaMostrador(new BigDecimal("150.00"));
        productoSinCategoria.setPrecioVentaTaller(new BigDecimal("0"));
        productoSinCategoria.setStockActual(10);
        productoSinCategoria.setStockMinimo(3);
        productoSinCategoria.setActivo(true);
        productoSinCategoria.setCategoria(null); // campo obligatorio

        // puede lanzar ConstraintViolationException o RuntimeException
        assertThrows(ConstraintViolationException.class, 
            () -> productoService.guardar(productoSinCategoria));
        
        // verificar que nunca se llamó al repositorio
        verify(productoRepository, never()).save(any(Producto.class));
    };

    @Test
    @DisplayName("Debe fallar al guardar producto sin precio de venta en mostrador")
    void guardarProducto_SinPrecioVentaMostrador_Falla() {
        // Crear producto sin precio de venta mostrador
        Producto productoSinCategoria = new Producto();
        productoSinCategoria.setId(2L);
        productoSinCategoria.setNombre("Filtro de Aire");
        productoSinCategoria.setMarca(marcaBase);
        productoSinCategoria.setCategoria(categoriaBase);
        productoSinCategoria.setPrecioCompra(new BigDecimal("100.00"));
        productoSinCategoria.setPrecioVentaMostrador(null);
        productoSinCategoria.setPrecioVentaTaller(new BigDecimal("0"));
        productoSinCategoria.setStockActual(10);
        productoSinCategoria.setStockMinimo(3);
        productoSinCategoria.setActivo(true);

        // puede lanzar ConstraintViolationException o RuntimeException
        assertThrows(ConstraintViolationException.class, 
            () -> productoService.guardar(productoSinCategoria));
        
        // verificar que nunca se llamó al repositorio
        verify(productoRepository, never()).save(any(Producto.class));
    };

    // ==========================
    // 🧹 Editar Producto
    // ==========================

    @Test
    @DisplayName("Debe fallar si no se puede recuperar el producto después de guardarlo")
    void guardarProducto_NoSePuedeRecuperarDespuesDeGuardar() {
        when(productoRepository.save(productoBase)).thenReturn(productoBase);
        when(productoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> productoService.guardar(productoBase));

        verify(productoRepository).save(productoBase);
        verify(productoRepository).findById(1L);
    };

    // ==========================
    // 🧹 Filtrar Productos
    // ==========================
    @Test
    @DisplayName("Debe listar los productos activos")
    void listarActivos_Exito() {
        when(productoRepository.findByActivoTrue()).thenReturn(List.of(productoBase));

        List<Producto> resultado = productoService.listarActivos();

        assertThat(resultado).containsExactly(productoBase);
        verify(productoRepository).findByActivoTrue();
    };

    @Test
    @DisplayName("Debe listar todos los productos")
    void listarTodos_Exito() {
        Producto otroProducto = new Producto();
        otroProducto.setId(2L);
        when(productoRepository.findAll()).thenReturn(List.of(productoBase, otroProducto));

        List<Producto> resultado = productoService.listarTodos();

        assertThat(resultado).containsExactly(productoBase, otroProducto);
        verify(productoRepository).findAll();
    };

    @Test 
    @DisplayName ("Debes lanzar excepcion si el producto no existe por ID")
    void obtenerPorId_NoEncontrado(){
        // Buscar por id no existente
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThat(productoService.obtenerPorId(99L)).isEmpty();
        verify(productoRepository, times(1)).findById(99L);
    };

    @Test
    @DisplayName("Debe obtener un producto existente por ID")
    void obtenerPorId_Encontrado() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));

        assertThat(productoService.obtenerPorId(1L)).contains(productoBase);
        verify(productoRepository).findById(1L);
    };

    @Test
    @DisplayName("Debe buscar productos por criterio")
    void buscar_PorCriterio() {
        when(productoRepository.searchProductos("filtro")).thenReturn(List.of(productoBase));

        List<Producto> resultado = productoService.buscar("filtro");

        assertThat(resultado).containsExactly(productoBase);
        verify(productoRepository).searchProductos("filtro");
    };

    @Test
    @DisplayName("Debe buscar productos por especificación")
    void obtenerProductos_PorEspecificacion_Activo() {
        Specification<Producto> spec =
                (root, query, cb) -> cb.isTrue(root.get("activo"));

        when(productoRepository.findAll(spec))
                .thenReturn(List.of(productoBase));

        var resultado = productoService.buscarConEspecificacion(spec);

        assertThat(resultado).containsExactly(productoBase);
        verify(productoRepository).findAll(spec);
    };

    // ==========================
    // 🧹 Actualizar Stock
    // ==========================
    @Test 
    @DisplayName ("Debes actualizar correctamente el stock de un producto")
    void actualizarStockEntrada_Exito(){
        // actualizar stock de entrada
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        // Sumar 5 unidades al stock actual (15 + 5 = 20)
        Producto resultado = productoService.ajustarStock(1L, TipoMovimiento.ENTRADA, 5, "testing");

        assertThat(resultado.getStockActual()).isEqualTo(20);
        verify(productoRepository, times(1)).save(productoBase);

        ArgumentCaptor<MovimientoInventario> movimientoCaptor =
                ArgumentCaptor.forClass(MovimientoInventario.class);
        verify(movimientoInventarioRepository).save(movimientoCaptor.capture());
        MovimientoInventario movimiento = movimientoCaptor.getValue();
        assertThat(movimiento.getProducto()).isSameAs(productoBase);
        assertThat(movimiento.getTipoMovimiento()).isEqualTo(TipoMovimiento.ENTRADA);
        assertThat(movimiento.getCantidad()).isEqualTo(5);
        assertThat(movimiento.getMotivo()).isEqualTo("testing");
        assertThat(movimiento.getFecha()).isNotNull();
    };

    @Test 
    @DisplayName ("Debe ajustar la salida del stock correctamente")
    void actualizarStockSalida_StockSuficiente(){
        // actualizar la salida de stock que es suficiente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        // Intentar restar 5 unidades (15 - 5 = 10)
        Producto resultado = productoService.ajustarStock(1L, TipoMovimiento.SALIDA, 5, "testing");

        assertThat(resultado.getStockActual()).isEqualTo(10);
        verify(productoRepository, times(1)).save(productoBase);
    };

    @Test 
    @DisplayName ("Debe lanzar excepción si el ajuste es una cantidad mayor al stock actual")
    void actualizarStockSalida_StockInsuficiente(){
        // actualizar la salida de stock que es insuficiente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));

        // Intentar restar 20 unidades cuando solo hay 15 disponibles
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productoService.ajustarStock(1L, TipoMovimiento.SALIDA, 20, "testing");
        });

        assertThat(exception.getMessage()).contains("suficiente");
        verify(productoRepository, never()).save(any());
        verifyNoInteractions(movimientoInventarioRepository);
    };

    @Test
    @DisplayName("Debe fallar si el producto no existe al ajustar el stock")
    void ajustarStock_ProductoInexistente() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productoService.ajustarStock(99L, TipoMovimiento.ENTRADA, 5, "testing"));

        assertThat(exception.getMessage()).contains("no encontrado");
        verify(productoRepository).findById(99L);
        verify(productoRepository, never()).save(any());
        verifyNoInteractions(movimientoInventarioRepository);
    };

    @Test 
    @DisplayName ("Debes aceptar si el ajuste de stock esta en valores negativos")
    void actualizarStockSalida_AceptaValorNegativo(){
        // actualizar la salida de stock que es suficiente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);


        // Intentar restar una unidad con 15 disponibles
        Producto resultado = productoService.ajustarStock(1L, TipoMovimiento.SALIDA, -1, "testing");

        assertThat(resultado.getStockActual()).isEqualTo(14);
        verify(productoRepository, times(1)).save(productoBase);
    };

    // ==========================
    // 🧹 Desactivar Producto
    // ==========================

    @Test 
    @DisplayName ("Debes realizar la baja lógica (desactivar) de un producto")
    void desactivarProducto_exito(){
        // desactivar un producto correctamente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        boolean resultado = productoService.eliminarLogico(1L);
        assertThat(resultado).isTrue();
        assertThat(productoBase.getActivo()).isFalse();
        verify(productoRepository, times(1)).save(productoBase);
    };

    @Test 
    @DisplayName ("Debes no realizar la baja lógica (desactivar) de un producto ya desactivado")
    void desactivarProducto_DesactivadoFalla(){
        // desactivar un producto ya desactivado falla
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        productoService.eliminarLogico(1L);
        boolean resultado = productoService.eliminarLogico(1L);
        assertThat(resultado).isFalse();
        assertThat(productoBase.getActivo()).isFalse();
        verify(productoRepository, times(1)).save(productoBase);
    };

    @Test 
    @DisplayName ("Debes regresar falso al realizar la baja lógica (desactivar) de un producto inexistente")
    void desactivarProducto_Inexistente(){
        when(productoRepository.findById(33L)).thenReturn(Optional.empty());

        boolean resultado = productoService.eliminarLogico(33L);

        assertThat(resultado).isFalse();
        assertThat(productoBase.getActivo()).isTrue();
        verify(productoRepository, never()).save(any(Producto.class));
    };

    // ==========================
    // 🧹 Verificar Stock bajo
    // ==========================

    @Test 
    @DisplayName ("Debe detectar cuando el stock actual es menor al mínimo")
    void stockBajo_EsBajo(){
        productoBase.setStockActual(2);

        boolean resultado = productoService.esStockBajo(productoBase);

        assertThat(resultado).isTrue();
        verifyNoInteractions(productoRepository);
    };

    @Test 
    @DisplayName ("Debe detectar cuando el stock actual supera el mínimo")
    void stockBajo_NoEsBajo(){
        boolean resultado = productoService.esStockBajo(productoBase);

        assertThat(resultado).isFalse();
        verifyNoInteractions(productoRepository);
    };

};
