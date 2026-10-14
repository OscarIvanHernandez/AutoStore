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

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
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

    private Producto productoBase;
    private ValidatorFactory validatorFactory;

    @BeforeEach 
    void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        productoService = new ProductoService(
                productoRepository,
                movimientoInventarioRepository,
                validatorFactory.getValidator());

        productoBase = new Producto();
        productoBase.setId(1L);
        productoBase.setNombre("Filtro de Aceite");
        productoBase.setMarca("Gonher");
        productoBase.setCategoria("Filtros");
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

        Producto respuesta = productoService.guardar(productoBase);
        
        assertThat(respuesta).isNotNull();
        assertThat(respuesta.getId()).isEqualTo(1L);
        verify(productoRepository, times(1)).save(productoBase);
    };

    @Test
@DisplayName("Debe fallar al guardar producto sin marca")
void guardarProducto_SinMarca_Falla() {
    // Crear producto sin marca
    Producto productoSinMarca = new Producto();
    productoSinMarca.setId(2L);
    productoSinMarca.setNombre("Filtro de Aire");
    productoSinMarca.setCategoria("Filtros");
    productoSinMarca.setPrecioCompra(new BigDecimal("100.00"));
    productoSinMarca.setPrecioVentaMostrador(new BigDecimal("150.00"));
    productoSinMarca.setStockActual(10);
    productoSinMarca.setStockMinimo(3);
    productoSinMarca.setActivo(true);
    productoSinMarca.setMarca(null); // campo obligatorio

    // Dependiendo de tu implementación, puede lanzar ConstraintViolationException o RuntimeException
    assertThrows(ConstraintViolationException.class, 
        () -> productoService.guardar(productoSinMarca));
    
    // También puedes verificar que nunca se llamó al repositorio
    verify(productoRepository, never()).save(any(Producto.class));
}


    @Test 
    @DisplayName ("Debes lanzar excepcion si el producto no existe por ID")
    void obtenerPorId_NoEncontrado(){
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThat(productoService.obtenerPorId(99L)).isEmpty();
        verify(productoRepository, times(1)).findById(99L);
    };

    @Test 
    @DisplayName ("Debes actualizar correctamente el stock de un producto")
    void actualizarStockEntrada_Exito(){
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        // Sumar 5 unidades al stock actual (15 + 5 = 20)
        Producto resultado = productoService.ajustarStock(1L, TipoMovimiento.ENTRADA, 5, "testing");

        assertThat(resultado.getStockActual()).isEqualTo(20);
        verify(productoRepository, times(1)).save(productoBase);
    };

    @Test 
    @DisplayName ("Debe lanzar excepción si el ajuste deja el stock en valores negativos")
    void actualizarStockSalida_StockInsuficiente(){
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));

        // Intentar restar 20 unidades cuando solo hay 15 disponibles
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productoService.ajustarStock(1L, TipoMovimiento.SALIDA, 20, "testing");
        });

        assertThat(exception.getMessage()).contains("suficiente");
        verify(productoRepository, never()).save(any());
    };

    @Test 
    @DisplayName ("Debes realizar la baja lógica (desactivar) de un producto")
    void desactivarProducto_exito(){
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(productoRepository.save(any(Producto.class))).thenAnswer(i -> i.getArguments()[0]);

        productoService.eliminarLogico(1L);
        assertThat(productoBase.getActivo()).isFalse();
        verify(productoRepository, times(1)).save(productoBase);
    };
};
