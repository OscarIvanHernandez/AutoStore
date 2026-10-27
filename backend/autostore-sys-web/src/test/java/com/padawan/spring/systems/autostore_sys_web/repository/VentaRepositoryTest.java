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
import com.padawan.spring.systems.autostore_sys_web.repository.specs.VentaSpecification;

@DataJpaTest
class VentaRepositoryTest {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private AbonoRepository abonoRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Cliente crearCliente(String nombre, String telefono) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre);
        cliente.setTelefono(telefono);
        cliente.setLimiteCredito(BigDecimal.ZERO);
        cliente.setDeudaActual(BigDecimal.ZERO);
        return entityManager.persistFlushFind(cliente);
    };

    private Venta crearVenta(Long clienteId, TipoVenta tipoVenta, LocalDateTime fechaVenta) {
        Venta venta = new Venta();
        venta.setClienteId(clienteId);
        venta.setFechaVenta(fechaVenta);
        venta.setSubtotal(new BigDecimal("100.00"));
        venta.setTotal(new BigDecimal("100.00"));
        venta.setDescuento(BigDecimal.ZERO);
        venta.setCambio(BigDecimal.ZERO);
        venta.setEfectivoRecibido(new BigDecimal("100.00"));
        venta.setTipoVenta(tipoVenta);
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setSaldoPendiente(BigDecimal.ZERO);
        venta.setEstadoPago(EstadoPago.PAGADO);
        venta.setMetodoPago("EFECTIVO");
        return venta;
    };

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
    };

    // ==========================
    // 🧹 Crear venta
    // ==========================
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
    };
    // ==========================
    // 🧹 Guardar abono
    // ==========================
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
    };

    // ==========================
    // 🧹 Buscar venta
    // ==========================
    @Test
    @DisplayName("Debe filtrar ventas por cliente, mes, año y tipo")
    void buscarPorEspecificacion_FiltrosCombinados() {
        Cliente cliente = crearCliente("Cliente objetivo", "5551111111");
        Cliente otroCliente = crearCliente("Otro cliente", "5552222222");

        Venta esperada = crearVenta(cliente.getId(), TipoVenta.CREDITO,
                LocalDateTime.of(2025, 6, 15, 12, 0));
        Venta otroTipo = crearVenta(cliente.getId(), TipoVenta.CONTADO,
                LocalDateTime.of(2025, 6, 16, 12, 0));
        Venta otroMes = crearVenta(cliente.getId(), TipoVenta.CREDITO,
                LocalDateTime.of(2025, 7, 1, 0, 0));
        Venta otroClienteVenta = crearVenta(otroCliente.getId(), TipoVenta.CREDITO,
                LocalDateTime.of(2025, 6, 20, 12, 0));
        entityManager.persist(esperada);
        entityManager.persist(otroTipo);
        entityManager.persist(otroMes);
        entityManager.persist(otroClienteVenta);
        entityManager.flush();

        List<Venta> resultado = ventaRepository.findAll(
                VentaSpecification.filtrar(cliente.getId(), 6, 2025, TipoVenta.CREDITO, null));

        assertThat(resultado)
                .extracting(Venta::getId)
                .containsExactly(esperada.getId());
    };

    @Test
    @DisplayName("Debe encontrar ventas por nombre de cliente sin distinguir mayúsculas")
    void buscarPorEspecificacion_TextoNombreClienteIgnoraMayusculas() {
        Cliente cliente = crearCliente("María González", "5553333333");
        Cliente otroCliente = crearCliente("Carlos López", "5554444444");
        Venta esperada = crearVenta(cliente.getId(), TipoVenta.CONTADO,
                LocalDateTime.of(2025, 5, 10, 10, 0));
        Venta noCoincide = crearVenta(otroCliente.getId(), TipoVenta.CONTADO,
                LocalDateTime.of(2025, 5, 10, 11, 0));
        entityManager.persist(esperada);
        entityManager.persist(noCoincide);
        entityManager.flush();

        List<Venta> resultado = ventaRepository.findAll(
                VentaSpecification.filtrar(null, null, null, null, "MARÍA"));

        assertThat(resultado)
                .extracting(Venta::getId)
                .containsExactly(esperada.getId());
    };

    @Test
    @DisplayName("Debe encontrar una venta por folio con prefijo")
    void buscarPorEspecificacion_FolioConPrefijo() {
        Cliente cliente = crearCliente("Cliente folio", "5555555555");
        Venta esperada = crearVenta(cliente.getId(), TipoVenta.CONTADO, LocalDateTime.now());
        entityManager.persist(esperada);
        entityManager.flush();

        List<Venta> resultado = ventaRepository.findAll(
                VentaSpecification.filtrar(null, null, null, null, "V-" + esperada.getId()));

        assertThat(resultado)
                .extracting(Venta::getId)
                .containsExactly(esperada.getId());
    };

    @Test
    @DisplayName("Debe encontrar ventas cuando el texto de búsqueda es el tipo")
    void buscarPorEspecificacion_TextoTipoCredito() {
        Cliente cliente = crearCliente("Cliente tipo", "5556666666");
        Venta esperada = crearVenta(cliente.getId(), TipoVenta.CREDITO,
                LocalDateTime.of(2025, 3, 10, 10, 0));
        Venta noCoincide = crearVenta(cliente.getId(), TipoVenta.CONTADO,
                LocalDateTime.of(2025, 3, 11, 10, 0));
        entityManager.persist(esperada);
        entityManager.persist(noCoincide);
        entityManager.flush();

        List<Venta> resultado = ventaRepository.findAll(
                VentaSpecification.filtrar(null, null, null, null, "crédito"));

        assertThat(resultado)
                .extracting(Venta::getId)
                .containsExactly(esperada.getId());
    };
};
