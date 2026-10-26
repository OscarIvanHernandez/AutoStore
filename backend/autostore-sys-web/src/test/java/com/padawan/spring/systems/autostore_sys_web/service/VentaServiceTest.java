package com.padawan.spring.systems.autostore_sys_web.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.internal.matchers.Null;
import org.mockito.junit.jupiter.MockitoExtension;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.DetalleVenta;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoPago;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoVentaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
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
        assertThat(resultado.getTipoVenta()).isEqualTo(TipoVenta.CONTADO);
        assertThat(resultado.getEstado()).isEqualTo(EstadoVenta.COMPLETADA);
        assertThat(resultado.getEstadoPago()).isEqualTo(EstadoPago.PAGADO);
        assertThat(resultado.getSaldoPendiente()).isEqualByComparingTo("0.00");
        assertThat(resultado.getDescuento()).isEqualByComparingTo("10.00");
        assertThat(resultado.getEfectivoRecibido()).isEqualByComparingTo("250.00");

        DetalleVenta detalle = resultado.getDetalles().get(0);
        assertThat(detalle.getProducto()).isSameAs(productoBase);
        assertThat(detalle.getCantidad()).isEqualTo(2);
        assertThat(detalle.getPrecioUnitario()).isEqualByComparingTo("120.00");
        assertThat(detalle.getPrecioCompraHistorico()).isEqualByComparingTo("80.00");
        assertThat(detalle.getSubtotal()).isEqualByComparingTo("240.00");

        ArgumentCaptor<Venta> ventaCaptor = ArgumentCaptor.forClass(Venta.class);
        verify(ventaRepository).save(ventaCaptor.capture());
        assertThat(ventaCaptor.getValue()).isSameAs(resultado);

        
        verify(productoRepository).save(productoBase);
        verify(ventaRepository).save(any(Venta.class));
    };

    @Test
    @DisplayName ("Debe registrar una venta a credito con un cliente exitosamente")
    void crearVenta_CreditoExitosa() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");

        Cliente cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNombre("test");
        cliente.setTelefono("1234567890");
        cliente.setLimiteCredito(new BigDecimal("600"));
        cliente.setDeudaActual(new BigDecimal("0"));
        cliente.setFechaRegistro(LocalDateTime.now());
    
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CREDITO");
        request.setClienteId(1L);
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("150.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(ventaRepository.save(any(Venta.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    
        Venta resultado = ventaService.crearVenta(request);
    
        assertThat(resultado.getSubtotal()).isEqualByComparingTo("240.00");
        assertThat(resultado.getTotal()).isEqualByComparingTo("240.00");
        assertThat(resultado.getCambio()).isEqualByComparingTo("0.00");
        assertThat(resultado.getDetalles()).hasSize(1);
        assertThat(productoBase.getStockActual()).isEqualTo(13);
        assertThat(resultado.getTipoVenta()).isEqualTo(TipoVenta.CREDITO);
        
        // Verificar estado de la venta y estado de pago
        assertThat(resultado.getEstado()).isEqualTo(EstadoVenta.COMPLETADA);
        assertThat(resultado.getCliente().getNombre()).isEqualTo(cliente.getNombre());
        assertThat(resultado.getEstadoPago()).isEqualTo(EstadoPago.PARCIAL);
        assertThat(resultado.getSaldoPendiente()).isEqualByComparingTo("90.00");

        assertThat(resultado.getDescuento()).isEqualByComparingTo("0");
        assertThat(resultado.getEfectivoRecibido()).isEqualByComparingTo("150.00");

        DetalleVenta detalle = resultado.getDetalles().get(0);
        assertThat(detalle.getProducto()).isSameAs(productoBase);
        assertThat(detalle.getCantidad()).isEqualTo(2);
        assertThat(detalle.getPrecioUnitario()).isEqualByComparingTo("120.00");
        assertThat(detalle.getPrecioCompraHistorico()).isEqualByComparingTo("80.00");
        assertThat(detalle.getSubtotal()).isEqualByComparingTo("240.00");

        ArgumentCaptor<Venta> ventaCaptor = ArgumentCaptor.forClass(Venta.class);
        verify(ventaRepository).save(ventaCaptor.capture());
        assertThat(ventaCaptor.getValue()).isSameAs(resultado);

        
        verify(productoRepository).save(productoBase);
        verify(ventaRepository).save(any(Venta.class));
        verify(clienteRepository).findById(1L);
        verify(clienteRepository).save(cliente);
        assertThat(cliente.getDeudaActual()).isEqualByComparingTo("90.00");
    };

    @Test
    @DisplayName ("Debe lanzar una excepción al crear una venta a credito sin un cliente")
    void crearVenta_CreditoSinCliente_LanzaExcepcion() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");
        
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CREDITO");
        request.setClienteId(null);
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("150.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
    
        RuntimeException resultado = assertThrows(RuntimeException.class, () -> ventaService.crearVenta(request));

        assertEquals("Las ventas a crédito requieren seleccionar un cliente", resultado.getMessage());
    };

    @Test
    @DisplayName ("Debe lanzar una excepción al crear una venta a credito sin encontrar un cliente")
    void crearVenta_CreditoClienteNoEncontrado_LanzaExcepcion() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");
    
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CREDITO");
        request.setClienteId(1L);
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("150.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(clienteRepository.findById(1L)).thenReturn(Optional.empty());
    
        RuntimeException resultado = assertThrows(RuntimeException.class, () -> ventaService.crearVenta(request));

        assertEquals("Cliente no encontrado", resultado.getMessage());
    };

    @Test
    @DisplayName ("Debe lanzar una excepción al crear una venta a credito con un cliente inactivo")
    void crearVenta_CreditoConClienteInactivo_LanzaExcepcion() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");

        Cliente cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNombre("test");
        cliente.setTelefono("1234567890");
        cliente.setLimiteCredito(new BigDecimal("600"));
        cliente.setDeudaActual(new BigDecimal("0"));
        cliente.setFechaRegistro(LocalDateTime.now());
        cliente.setActivo(false);
    
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CREDITO");
        request.setClienteId(1L);
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("150.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
    
        RuntimeException resultado = assertThrows(RuntimeException.class, () -> ventaService.crearVenta(request));

        assertEquals("El cliente seleccionado está inactivo.", resultado.getMessage());
    };

    @Test 
    @DisplayName ("Debees lanzar una excepcion al crear una venta sin productos")
    void crearVenta_SinProductos_LanzaExcepcion() {
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CONTADO");
        request.setProductos(Collections.emptyList());
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("250.00"));
        
        RuntimeException resultado = assertThrows(RuntimeException.class, 
            () -> ventaService.crearVenta(request));
        
        assertEquals("La venta debe incluir al menos un producto", resultado.getMessage());
    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion al no encontrar los productos para una venta")
    void crearVenta_ProductoNoEncontrado_LanzaExcepcion () {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");
        
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CONTADO");
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("250.00"));
        
        when(productoRepository.findById(1L)).thenReturn(Optional.empty());
        
        RuntimeException resultado = assertThrows(RuntimeException.class, 
            () -> ventaService.crearVenta(request));
        
        assertEquals("Producto no encontrado con ID: 1", resultado.getMessage());
    };

    @Test
    @DisplayName ("Debe lanzar una excepción en una venta a credito donde se revasa el limite de cliente con deuda")
    void crearVenta_CreditoExcedeLimiteDeCliente_LanzaExcepcion() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(2);
        item.setPrecioTipo("MOSTRADOR");

        Cliente cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNombre("test");
        cliente.setTelefono("1234567890");
        cliente.setLimiteCredito(new BigDecimal("600"));
        cliente.setDeudaActual(new BigDecimal("500"));
        cliente.setFechaRegistro(LocalDateTime.now());
    
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CREDITO");
        request.setClienteId(1L);
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("100.00"));
    
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
    
        RuntimeException resultado = assertThrows(RuntimeException.class, 
            ()-> ventaService.crearVenta(request));

        assertEquals(
            "La venta excede el límite de crédito del cliente. Límite: $600.00, Deuda actual: $500.00",
            resultado.getMessage());
    
    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion si un producto tiene stock insuficiente par una venta")
    void crearVenta_StockInsuficiente_LanzaExcepcion () {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(2L);
        item.setCantidad(5);
        item.setPrecioTipo("MOSTRADOR");
        
        Producto producto = productoBase;
        producto.setId(2L);
        producto.setStockActual(2);
        
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CONTADO");
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("250.00"));
        
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto));
        
        RuntimeException resultado = assertThrows(RuntimeException.class, 
            () -> ventaService.crearVenta(request));
        
        assertEquals("Stock insuficiente para: Filtro de aceite", resultado.getMessage());
    };

    @Test 
    @DisplayName ("Debes lanzar una excepcion con una venta al contado y el pago insuficiente")
    void crearVenta_EfectivoInsuficiente_LanzaExcepcion() {
        ProductoVentaDTO item = new ProductoVentaDTO();
        item.setId(1L);
        item.setCantidad(5);
        item.setPrecioTipo("MOSTRADOR");
        
        VentaRequestDTO request = new VentaRequestDTO();
        request.setTipoVenta("CONTADO");
        request.setProductos(List.of(item));
        request.setDescuento(new BigDecimal("0"));
        request.setEfectivoRecibido(new BigDecimal("230.00"));
        
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoBase));
        
        RuntimeException resultado = assertThrows(RuntimeException.class, 
            () -> ventaService.crearVenta(request));
        
        assertEquals(
            "El efectivo recibido debe ser mayor o igual al total de la venta", 
            resultado.getMessage()
        );
    };
    // ==========================
    // 🧹 Listar ventas
    // ==========================
    @Test 
    @DisplayName ("Debe regresar una lista de ventas registradas")
    void obtener_Ventas() {

        Venta venta1 = new Venta();
        venta1.setId(1L);
        Venta venta2 = new Venta();
        venta2.setId(2L);

        List<Venta> ventas = List.of(venta1, venta2);

        when(ventaRepository.findAll()).thenReturn(ventas);

        List<Venta> resultado = ventaService.obtenerTodas();

        assertThat(resultado).hasSize(2);
        verify(ventaRepository).findAll();
    };

    @Test 
    @DisplayName ("Debe regresar encontrar ventas por SU Id")
    void obtener_VentasPorId() {
        
        Venta venta1 = new Venta();
        venta1.setId(1L);
        Venta venta2 = new Venta();
        venta2.setId(2L);

        when(ventaRepository.findById(1L)).thenReturn(Optional.of(venta1));
        when(ventaRepository.findById(2L)).thenReturn(Optional.of(venta2));
        when(ventaRepository.findById(3L)).thenReturn(Optional.empty());

        Optional<Venta> resultado = ventaService.obtenerPorId(1L);
        Optional<Venta> resultado2 = ventaService.obtenerPorId(2L);
        Optional<Venta> resultado3 = ventaService.obtenerPorId(3L);

        assertThat(resultado).isNotNull();
        assertThat(resultado.get().getId()).isEqualTo(1L);
        assertThat(resultado2).isNotNull();
        assertThat(resultado2.get().getId()).isEqualTo(2L);
        assertThat(resultado3).isEmpty();
        verify(ventaRepository).findById(1L);
        verify(ventaRepository).findById(2L);
        verify(ventaRepository).findById(3L);
    };

    @Test 
    @DisplayName ("Debe regresar una lista de ventas del dia")
    void obtener_VentasDia() {

        Venta venta1 = new Venta();
        venta1.setId(1L);
        venta1.setFechaVenta(LocalDateTime.now());
        Venta venta2 = new Venta();
        venta2.setId(2L);
        venta2.setFechaVenta(LocalDateTime.now());
        Venta venta3 = new Venta();
        venta3.setId(3L);

        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fin = LocalDate.now().atTime(LocalTime.MAX);
        List<Venta> ventas = List.of(venta1, venta2);

        when(ventaRepository.findByFechaVentaBetween(inicio, fin)).thenReturn(ventas);

        List<Venta> resultado = ventaService.obtenerVentasDelDia();

        assertThat(resultado).hasSize(2);
        verify(ventaRepository).findByFechaVentaBetween(inicio, fin);
    };

    
};
