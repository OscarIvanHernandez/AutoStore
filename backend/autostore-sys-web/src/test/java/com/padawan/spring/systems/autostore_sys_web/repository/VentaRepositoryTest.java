package com.padawan.spring.systems.autostore_sys_web.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.Abono;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoPago;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;

@DataJpaTest
class VentaRepositoryTest {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private AbonoRepository abonoRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Debe listar solo ventas de crédito completadas con saldo pendiente del cliente")
    void findVentasPendientesCreditoPorCliente() {
        Cliente cliente = new Cliente();
        cliente.setNombre("Cliente prueba");
        cliente.setTelefono("5551234567");
        cliente.setLimiteCredito(BigDecimal.ZERO);
        cliente.setDeudaActual(new BigDecimal("100.00"));
        cliente = entityManager.persistFlushFind(cliente);

        Cliente otroCliente = new Cliente();
        otroCliente.setNombre("Otro cliente");
        otroCliente.setTelefono("5559876543");
        otroCliente.setLimiteCredito(BigDecimal.ZERO);
        otroCliente.setDeudaActual(new BigDecimal("30.00"));
        otroCliente = entityManager.persistFlushFind(otroCliente);

        Venta pendiente = crearVenta(cliente.getId(), TipoVenta.CREDITO, EstadoVenta.COMPLETADA,
                new BigDecimal("100.00"));
        Venta pagada = crearVenta(cliente.getId(), TipoVenta.CREDITO, EstadoVenta.COMPLETADA,
                BigDecimal.ZERO);
        Venta cancelada = crearVenta(cliente.getId(), TipoVenta.CREDITO, EstadoVenta.CANCELADA,
                new BigDecimal("50.00"));
        Venta deOtroCliente = crearVenta(otroCliente.getId(), TipoVenta.CREDITO, EstadoVenta.COMPLETADA,
                new BigDecimal("30.00"));

        entityManager.persist(pendiente);
        entityManager.persist(pagada);
        entityManager.persist(cancelada);
        entityManager.persist(deOtroCliente);
        entityManager.flush();

        List<Venta> resultado =
                ventaRepository.findByClienteIdAndTipoVentaAndEstadoAndSaldoPendienteGreaterThanOrderByFechaVentaAsc(
                        cliente.getId(), TipoVenta.CREDITO, EstadoVenta.COMPLETADA, BigDecimal.ZERO);

        assertThat(resultado)
                .extracting(Venta::getId)
                .containsExactly(pendiente.getId());
    }

    @Test
    @DisplayName("Debe persistir la relación entre el abono y su venta")
    void guardarAbono_ConVentaRelacionada() {
        Cliente cliente = new Cliente();
        cliente.setNombre("Cliente con abono");
        cliente.setTelefono("5551234567");
        cliente.setLimiteCredito(BigDecimal.ZERO);
        cliente.setDeudaActual(new BigDecimal("60.00"));
        cliente = entityManager.persistFlushFind(cliente);

        Venta venta = crearVenta(cliente.getId(), TipoVenta.CREDITO, EstadoVenta.COMPLETADA,
                new BigDecimal("60.00"));
        venta = entityManager.persistFlushFind(venta);

        Abono abono = new Abono(cliente, venta, new BigDecimal("40.00"), new BigDecimal("20.00"));
        abono = abonoRepository.saveAndFlush(abono);
        entityManager.clear();

        Abono persisted = abonoRepository.findById(abono.getId()).orElseThrow();

        assertThat(persisted.getVentaId()).isEqualTo(venta.getId());
        assertThat(persisted.getVenta().getId()).isEqualTo(venta.getId());
    }

    private Venta crearVenta(Long clienteId, TipoVenta tipo, EstadoVenta estado, BigDecimal saldoPendiente) {
        Venta venta = new Venta();
        venta.setClienteId(clienteId);
        venta.setFechaVenta(LocalDateTime.now());
        venta.setSubtotal(new BigDecimal("100.00"));
        venta.setTotal(new BigDecimal("100.00"));
        venta.setDescuento(BigDecimal.ZERO);
        venta.setCambio(BigDecimal.ZERO);
        venta.setEfectivoRecibido(BigDecimal.ZERO);
        venta.setTipoVenta(tipo);
        venta.setEstado(estado);
        venta.setSaldoPendiente(saldoPendiente);
        venta.setEstadoPago(saldoPendiente.signum() == 0 ? EstadoPago.PAGADO : EstadoPago.PENDIENTE);
        venta.setMetodoPago("EFECTIVO");
        return venta;
    }
}
