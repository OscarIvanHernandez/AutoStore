package com.padawan.spring.systems.autostore_sys_web.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.padawan.spring.systems.autostore_sys_web.model.Abono;
import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoPago;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.repository.AbonoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AbonoRepository abonoRepository;

    @Mock
    private VentaRepository ventaRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    private Venta venta;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId(5L);
        cliente.setNombre("Cliente prueba");
        cliente.setTelefono("5551234567");
        cliente.setDeudaActual(new BigDecimal("140.00"));

        venta = new Venta();
        venta.setId(10L);
        venta.setClienteId(cliente.getId());
        venta.setTipoVenta(TipoVenta.CREDITO);
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setEstadoPago(EstadoPago.PARCIAL);
        venta.setTotal(new BigDecimal("200.00"));
        venta.setSaldoPendiente(new BigDecimal("100.00"));
    }

    @Test
    @DisplayName("Debe aplicar un abono a la venta y actualizar el saldo del cliente")
    void registrarAbono_ActualizaSaldoDeVentaYCliente() {
        when(clienteRepository.findById(5L)).thenReturn(Optional.of(cliente));
        when(ventaRepository.findById(10L)).thenReturn(Optional.of(venta));
        when(abonoRepository.save(any(Abono.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Abono abono = clienteService.registrarAbono(5L, 10L, new BigDecimal("40.00"));

        assertThat(abono.getCliente()).isSameAs(cliente);
        assertThat(abono.getVenta()).isSameAs(venta);
        assertThat(abono.getVentaId()).isEqualTo(10L);
        assertThat(abono.getMonto()).isEqualByComparingTo("40.00");
        assertThat(abono.getSaldoRestante()).isEqualByComparingTo("60.00");
        assertThat(venta.getSaldoPendiente()).isEqualByComparingTo("60.00");
        assertThat(venta.getEstadoPago()).isEqualTo(EstadoPago.PARCIAL);
        assertThat(cliente.getDeudaActual()).isEqualByComparingTo("100.00");

        verify(clienteRepository).save(cliente);
        verify(ventaRepository).save(venta);
        verify(abonoRepository).save(abono);
    }

    @Test
    @DisplayName("Debe marcar la venta como pagada cuando el abono cubre el saldo")
    void registrarAbono_LiquidaVenta() {
        venta.setSaldoPendiente(new BigDecimal("100.00"));
        cliente.setDeudaActual(new BigDecimal("100.00"));
        when(clienteRepository.findById(5L)).thenReturn(Optional.of(cliente));
        when(ventaRepository.findById(10L)).thenReturn(Optional.of(venta));
        when(abonoRepository.save(any(Abono.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Abono abono = clienteService.registrarAbono(5L, 10L, new BigDecimal("100.00"));

        assertThat(abono.getSaldoRestante()).isEqualByComparingTo("0.00");
        assertThat(venta.getSaldoPendiente()).isEqualByComparingTo("0.00");
        assertThat(venta.getEstadoPago()).isEqualTo(EstadoPago.PAGADO);
        assertThat(cliente.getDeudaActual()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Debe rechazar una venta que pertenece a otro cliente")
    void registrarAbono_VentaDeOtroCliente() {
        when(clienteRepository.findById(5L)).thenReturn(Optional.of(cliente));
        venta.setClienteId(99L);
        when(ventaRepository.findById(10L)).thenReturn(Optional.of(venta));

        assertThrows(IllegalArgumentException.class,
                () -> clienteService.registrarAbono(5L, 10L, new BigDecimal("20.00")));

        verify(clienteRepository, never()).save(any(Cliente.class));
        verify(ventaRepository, never()).save(any(Venta.class));
        verify(abonoRepository, never()).save(any(Abono.class));
    }

    @Test
    @DisplayName("Debe rechazar un abono mayor al saldo pendiente de la venta")
    void registrarAbono_MontoMayorAlSaldoDeVenta() {
        when(clienteRepository.findById(5L)).thenReturn(Optional.of(cliente));
        when(ventaRepository.findById(10L)).thenReturn(Optional.of(venta));

        assertThrows(IllegalArgumentException.class,
                () -> clienteService.registrarAbono(5L, 10L, new BigDecimal("100.01")));

        verify(clienteRepository, never()).save(any(Cliente.class));
        verify(ventaRepository, never()).save(any(Venta.class));
        verify(abonoRepository, never()).save(any(Abono.class));
    }
}
