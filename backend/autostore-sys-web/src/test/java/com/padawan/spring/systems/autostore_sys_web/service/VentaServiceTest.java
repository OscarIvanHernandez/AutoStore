package com.padawan.spring.systems.autostore_sys_web.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoVentaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.model.VentaRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;


@ExtendWith (MockitoExtension.class)
public class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;
    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private ClienteRepository clienteRepository;
    
    @InjectMocks 
    private VentaService ventaService;
    
    private Producto productoBase;
    private  ProductoCategoria categoriaBase;
    private ProductoMarca marcaBase;
    
    @BeforeEach
    void setUp() {
        marcaBase = new ProductoMarca();
        marcaBase.setId(1L);
        marcaBase.setNombre("Gonher");
        marcaBase.setActivo(true);

        categoriaBase = new ProductoCategoria();
        categoriaBase.setId(1L);
        categoriaBase.setNombre("Filtros");
        categoriaBase.setActivo(true);

        productoBase = new Producto();
        productoBase.setId(1L);
        productoBase.setNombre("Filtro de aceite");
        productoBase.setCategoria(categoriaBase);
        productoBase.setMarca(marcaBase);
        productoBase.setPrecioCompra(new BigDecimal("80.00"));
        productoBase.setPrecioVentaMostrador(new BigDecimal("120.00"));
        productoBase.setPrecioVentaTaller(BigDecimal.ZERO);
        productoBase.setStockActual(15);
        productoBase.setStockMinimo(5);
        productoBase.setActivo(true);
    };

    // ==========================
    // 🧹 Crear venta
    // ==========================
    @Test
    @DisplayName ("Debe registrar una venta al contado exitosamente")
    void crearVenta_ContadoExitosa() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");
    
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CONTADO");
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("10.00"));
        request.setEfectivoRecibido(new BigDecimal("250.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(ventaRepository.save(any(Venta.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    
        Venta resultado = ventaService.crearVenta(request);
    
        assertThat(resultado.getSubtotal()).isEqualByComparingTo("240.00");
        assertThat(resultado.getTotal()).isEqualByComparingTo("230.00");
        assertThat(resultado.getCambio()).isEqualByComparingTo("20.00");
        assertThat(resultado.getDetalles()).hasSize(1);
        assertThat(productoBase.getStockActual()).isEqualTo(13);
    
        verify(productoRepository).save(productoBase);
        verify(ventaRepository).save(any(Venta.class));
        verifyNoInteractions(clienteRepository);
    };

    @Test 
    @DisplayName ("Debees lanzar una excepcion al crear una venta sin productos")
    void crearVenta_SinProductos_LanzaExcepcion() {

    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion al no encontrar los productos para una venta")
    void crearVenta_ProductoNoEncontrado_LanzaExcepcion () {

    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion si un producto tiene stock insuficiente par una venta")
    void crearVenta_StockInsuficiente_LanzaExcepcion () {

    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion con una venta al contado y el pago insuficiente")
    void crearVenta_EfectivoInsuficiente_LanzaExcepcion() {

    };

};
