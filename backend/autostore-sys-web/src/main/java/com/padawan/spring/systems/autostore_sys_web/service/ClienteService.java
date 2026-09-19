package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.Abono;
import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.repository.AbonoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;

import jakarta.transaction.Transactional;

@Service 
public class ClienteService {

    @Autowired 
    private ClienteRepository clienteRepository;

    @Autowired
    private AbonoRepository abonoRepository;

    // --- ISSUE-15: CRUD y Búsquedas ---

    public List<Cliente> listarClientes(String filtro) {
        if (filtro != null && !filtro.trim().isEmpty()) {
            return clienteRepository.findByNombreContainingIgnoreCaseOrTelefonoContainingIgnoreCase(filtro.trim(), filtro.trim());
        }
        return clienteRepository.findAll();
    }

    public List<Cliente> listarClientesActivos(String filtro) {
        if (filtro != null && !filtro.trim().isEmpty()) {
            return clienteRepository.buscarActivos(filtro.trim());
        }
        return clienteRepository.findByActivoTrue();
    }

    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));
    }

    @Transactional 
    public Cliente crearCliente(Cliente cliente) {
        cliente.setDeudaActual(BigDecimal.ZERO);
        cliente.setActivo(true);
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizarCliente(Long id, Cliente datosActualizados) {
        Cliente cliente = obtenerPorId(id);
        cliente.setNombre(datosActualizados.getNombre());
        cliente.setTelefono(datosActualizados.getTelefono());
        cliente.setCorreo(datosActualizados.getCorreo());
        cliente.setDireccion(datosActualizados.getDireccion());
        cliente.setLimiteCredito(datosActualizados.getLimiteCredito());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public void cambiarEstadoActivo(Long id, boolean activo) {
        Cliente cliente = obtenerPorId(id);
        cliente.setActivo(activo);
        clienteRepository.save(cliente);
    }

    // --- ISSUE-17: Abonos y Liquidación de Deudas ---

    @Transactional
    public Abono registrarAbono(Long clienteId, BigDecimal monto) {
        Cliente cliente = obtenerPorId(clienteId);

        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto del abono debe ser mayor a cero.");
        }

        if (monto.compareTo(cliente.getDeudaActual()) > 0) {
            throw new IllegalArgumentException("El abono ($" + monto + ") no puede ser mayor a la deuda actual ($" + cliente.getDeudaActual() + ").");
        }

        BigDecimal nuevoSaldo = cliente.getDeudaActual().subtract(monto);
        cliente.setDeudaActual(nuevoSaldo);
        clienteRepository.save(cliente);

        Abono abono = new Abono(cliente, monto, nuevoSaldo);
        return abonoRepository.save(abono);
    }

    public List<Abono> obtenerHistorialAbonos(Long clienteId) {
        return abonoRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    // --- ISSUE-18: Deudores y Estadísticas ---

    public List<Cliente> obtenerDeudores() {
        return clienteRepository.findByDeudaActualGreaterThanAndActivoTrueOrderByDeudaActualDesc(BigDecimal.ZERO);
    }

    public Map<String, Object> obtenerEstadisticasDeudores() {
        Long totalDeudores = clienteRepository.contarClientesDeudores();
        BigDecimal sumaDeudas = clienteRepository.sumarTotalDeudas();

        if (sumaDeudas == null) sumaDeudas = BigDecimal.ZERO;
        if (totalDeudores == null) totalDeudores = 0L;

        BigDecimal deudaPromedio = totalDeudores > 0 
                ? sumaDeudas.divide(BigDecimal.valueOf(totalDeudores), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDeudores", totalDeudores);
        stats.put("sumaDeudas", sumaDeudas);
        stats.put("deudaPromedio", deudaPromedio);
        return stats;
    }
}
