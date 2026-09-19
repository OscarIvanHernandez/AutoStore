package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.Cliente;
import com.padawan.spring.systems.autostore_sys_web.model.DetalleVenta;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoVentaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.Venta;
import com.padawan.spring.systems.autostore_sys_web.model.VentaRequestDTO;
import com.padawan.spring.systems.autostore_sys_web.repository.ClienteRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.DetalleVentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.ProductoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.specs.VentaSpecification;

import jakarta.transaction.Transactional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired ClienteRepository clienteRepository;

    @Transactional
    public Venta crearVenta(VentaRequestDTO request) {
        // 1. Validar si es a crédito que traiga clienteId[cite: 1]
        if (request.getProductos() == null || request.getProductos().isEmpty()) {
            throw new IllegalArgumentException("La venta debe incluir al menos un producto");
        }
        
        TipoVenta tipoVenta = TipoVenta.valueOf(request.getTipoVenta().toUpperCase());
        
        // 2. Crear la entidad Venta e iterar sobre los productos recibidos
        Venta venta = new Venta();
        venta.setFechaVenta(LocalDateTime.now());
        venta.setTipoVenta(tipoVenta);
        venta.setClienteId(request.getClienteId());
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setMetodoPago("EFECTIVO");

        BigDecimal descuento = request.getDescuento() != null ? 
            request.getDescuento() : BigDecimal.ZERO;
        venta.setDescuento(descuento);

        BigDecimal subtotalGeneral = BigDecimal.ZERO;
        
        // 3. Por cada producto: 
        //    - Buscar el producto en BD.
        //    - Verificar que haya stock suficiente.
        //    - Descontar el stock[cite: 1].
        //    - Crear el DetalleVenta calculando cantidad * precioUnitario[cite: 1].
        for (ProductoVentaDTO item: request.getProductos()){
            // Buscar productos en BD
            Producto producto = productoRepository.findById(item.getId())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getId()));

            // Validar stock disponible
            if (producto.getStockActual() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }
            producto.setStockActual(producto.getStockActual() - item.getCantidad());
            productoRepository.save(producto);

            // Determinar precio segun el tipo "MOSTRADO"/"TALLER"
            BigDecimal precioAplicado = "TALLER".equalsIgnoreCase(item.getPrecioTipo())
                ? producto.getPrecioVentaTaller()
                : producto.getPrecioVentaMostrador();
            
            // Crear detalles, congelando el precio actual
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioAplicado);

            BigDecimal subtotalDetalle = precioAplicado.multiply(BigDecimal.valueOf(item.getCantidad()));
            detalle.setSubtotal(subtotalDetalle);

            // Agregar a la lista de detalles de la venta
            venta.getDetalles().add(detalle);

            // Acumular subtotal general
            subtotalGeneral = subtotalGeneral.add(subtotalDetalle);
        }   
        // 4. Guardar la venta (Spring Data JPA guardará los detalles en cascada automáticamente gracias al CascadeType.ALL).
        venta.setSubtotal(subtotalGeneral);

        BigDecimal totalFinal = subtotalGeneral.subtract(descuento);
        totalFinal = totalFinal.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : totalFinal;
        venta.setTotal(totalFinal);

        BigDecimal efectivoRecibido = request.getEfectivoRecibido() != null
            ? request.getEfectivoRecibido()
            : BigDecimal.ZERO;

        if (tipoVenta == TipoVenta.CREDITO) {
            if (request.getClienteId() == null) {
                throw new IllegalArgumentException("Las ventas a crédito requieren seleccionar un cliente");   
            }
            
            Cliente cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            if (!cliente.isActivo()) {
                throw new IllegalStateException("El cliente seleccionado está inactivo.");
            }

            // Regla ISSUE-16: Validar límite de crédito si es mayor a 0
            BigDecimal limite = cliente.getLimiteCredito();
            if (efectivoRecibido.compareTo(BigDecimal.ZERO) < 0 || efectivoRecibido.compareTo(totalFinal) > 0) {
                throw new IllegalArgumentException("El efectivo recibido en una venta a crédito debe estar entre cero y el total de la venta");
            }

            BigDecimal deudaVenta = totalFinal.subtract(efectivoRecibido);
            BigDecimal nuevaDeuda = cliente.getDeudaActual().add(deudaVenta);

            if (limite.compareTo(BigDecimal.ZERO) > 0 && nuevaDeuda.compareTo(limite) > 0) {
                throw new IllegalStateException(
                    String.format("La venta excede el límite de crédito del cliente. Límite: $%.2f, Deuda actual: $%.2f",
                            limite, cliente.getDeudaActual())
                );
            }

            // Actualizar la deuda acumulada del cliente
            cliente.setDeudaActual(nuevaDeuda);
            clienteRepository.save(cliente);

            venta.setClienteId(cliente.getId());
            
        }
        if (tipoVenta == TipoVenta.CONTADO) {
            efectivoRecibido = request.getEfectivoRecibido() != null ? request.getEfectivoRecibido() : totalFinal;
            if (efectivoRecibido.compareTo(totalFinal) < 0) {
                throw new IllegalArgumentException("El efectivo recibido debe ser mayor o igual al total de la venta");
            }
            venta.setEfectivoRecibido(efectivoRecibido);
            venta.setCambio(efectivoRecibido.subtract(totalFinal));
        } else {
            venta.setEfectivoRecibido(efectivoRecibido);
            venta.setCambio(BigDecimal.ZERO);
        }

        return ventaRepository.save(venta);
    }

    // Obtener todas las ventas realizadas
    public List<Venta> obtenerTodas() {
        return ventaRepository.findAll();
    }

    // Obtener venta por ID
    public Optional<Venta> obtenerPorId(Long id) {
        return ventaRepository.findById(id);
    }

    // Obtener ventas del dia
    public List<Venta> obtenerVentasDelDia() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();

        LocalDateTime fin = LocalDate.now().atTime(LocalTime.MAX);

        return ventaRepository.findByFechaVentaBetween(inicio, fin);
    }

    public List<Venta> buscarConEspecificacion(Specification<Venta> spec){
        return ventaRepository.findAll(spec);
    }

    public List<Venta> buscarVentas(Long clienteId, Integer mes, Integer anio, String q) {
        Specification<Venta> spec = VentaSpecification.filtrar(clienteId, mes, anio, q);
        return ventaRepository.findAll(spec);
    }

    public List<Map<String, Integer>> obtenerMesesDisponibles() {
        List<Object[]> resultados = ventaRepository.findMesesConVentas();
        return resultados.stream().map(row -> Map.of(
            "anio", (Integer) row[0],
            "mes", (Integer) row[1]
        )).toList();
    }

    // Cancelar una venta realizada en el dia de hoy
    @Transactional 
    public Venta cancelarVenta( Long id) {
        // Buscar venta y validar que no esta ya cancelada
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
        
        if (venta.getEstado() == EstadoVenta.CANCELADA) {
            throw new RuntimeException("La venta ya se encuentra cancelada");
        }

        // Validar que la venta haya sido realizada el dia de hoy
        LocalDate fechaVenta = venta.getFechaVenta().toLocalDate();
        LocalDate hoy = LocalDate.now();

        if (!fechaVenta.equals(hoy)) {
            throw new RuntimeException("Solo se pueden cancelar ventas realizadas el dia de hoy");
        }

        // Revertir stock de cada producto

        for (DetalleVenta detalle: venta.getDetalles()) {
            Producto producto = detalle.getProducto();

            // Se devuelven las unidades al stock
            producto.setStockActual(producto.getStockActual() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        // Cambiar el estado de la venta
        venta.setEstado(EstadoVenta.CANCELADA);

        return ventaRepository.save(venta);
    }

}
