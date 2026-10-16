package com.padawan.spring.systems.autostore_sys_web.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.padawan.spring.systems.autostore_sys_web.controller.ProductoController;
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

    @AfterEach
    void tearDown() {
        validatorFactory.close();
    };

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

    @Test 
    @DisplayName ("Debes lanzar excepcion si el producto no existe por ID")
    void obtenerPorId_NoEncontrado(){
        // Buscar por id no existente
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThat(productoService.obtenerPorId(99L)).isEmpty();
        verify(productoRepository, times(1)).findById(99L);
    };

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
    };

    @Test 
    @DisplayName ("Debe lanzar excepción si el ajuste deja el stock en valores negativos")
    void actualizarStockSalida_ValorNegativo(){
        // actualizar la salida de stock que es insuficiente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));

        // Intentar restar 20 unidades cuando solo hay 15 disponibles
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productoService.ajustarStock(1L, TipoMovimiento.SALIDA, -1, "testing");
        });

        assertThat(exception.getMessage()).contains("suficiente");
        verify(productoRepository, never()).save(any());
    };

    @Test 
    @DisplayName ("Debes realizar la baja lógica (desactivar) de un producto")
    void desactivarProducto_exito(){
        // desactivar un producto correctamente
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        productoService.eliminarLogico(1L);
        assertThat(productoBase.getActivo()).isFalse();
        verify(productoRepository, times(1)).save(productoBase);
    };
};
