package com.padawan.spring.systems.autostore_sys_web.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;

@ExtendWith (MockitoExtension.class)
public class ProductoServiceTest {

    @Mock 
    private ProductoRepository productoRepository;

    @InjectMocks 
    private ProductoService productoService;

    private Producto productoBase;

    @BeforeEach 
    void setUp() {
        productoBase = new Producto();
        productoBase.setId(1L);
        productoBase.setNombre("Filtro de Aceite");
        productoBase.setMarca("Gonher");
        productoBase.setCategoria("Filtros");
        productoBase.setPrecioCompra(new BigDecimal("80.00"));
        productoBase.setPrecioVentaMostrador(new BigDecimal("120.00"));
        productoBase.setStockActual(15);
        productoBase.setStockMinimo(5);
        productoBase.setActivo(true);
    };

    @Test 
    @DisplayName ("Debes guardar un producto nuevo correctamente")
    void guardarProducto_Exito(){
        when(productoRepository.save(any(Producto.class))).thenReturn(productoBase);

        Producto respuesta = productoService.guardar(productoBase);
        
        assertThat(respuesta).isNotNull();
        assertThat(respuesta.getId()).isEqualTo(1L);
        verify(productoRepository, times(1)).findById(1L);
    };
};
