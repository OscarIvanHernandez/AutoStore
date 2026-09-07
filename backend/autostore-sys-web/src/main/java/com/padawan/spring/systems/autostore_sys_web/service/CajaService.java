package com.padawan.spring.systems.autostore_sys_web.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.padawan.spring.systems.autostore_sys_web.model.CorteCaja;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoCajaDTO;
import com.padawan.spring.systems.autostore_sys_web.model.EstadoVenta;
import com.padawan.spring.systems.autostore_sys_web.model.TipoVenta;
import com.padawan.spring.systems.autostore_sys_web.repository.AbonoRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.CorteCajaRepository;
import com.padawan.spring.systems.autostore_sys_web.repository.VentaRepository;

@Service
public class CajaService {

    @Autowired
    private CorteCajaRepository corteCajaRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private AbonoRepository abonoRepository;

    public CorteCaja abrirCaja(BigDecimal efectivoInicial) {
        if (corteCajaRepository.existsByActivoTrue()) {
            throw new RuntimeException("Ya existe una caja abierta en el sistema.");
        }
        CorteCaja nuevaCaja = new CorteCaja(efectivoInicial);
        return corteCajaRepository.save(nuevaCaja);
    }

    public EstadoCajaDTO obtenerEstadoActual() {
        EstadoCajaDTO dto = new EstadoCajaDTO();
        var cajaOpt = corteCajaRepository.findByActivoTrue();

        if (cajaOpt.isEmpty()) {
            dto.setAbierta(false);
            return dto;
        }

        CorteCaja caja = cajaOpt.get();
        BigDecimal ventasEfectivo = ventaRepository.sumarVentasContadoDesde(
            EstadoVenta.COMPLETADA,
            TipoVenta.CONTADO,
            caja.getFechaApertura()
        );
        BigDecimal creditoEfectivo = ventaRepository.sumarEfectivoRecibidoDesde(
            EstadoVenta.COMPLETADA,
            TipoVenta.CREDITO,
            caja.getFechaApertura()
        );
        BigDecimal abonos = abonoRepository.sumarAbonosDesde(caja.getFechaApertura());
        BigDecimal efectivoIngresado = ventasEfectivo.add(creditoEfectivo).add(abonos);
        BigDecimal esperado = caja.getEfectivoInicial().add(efectivoIngresado);

        dto.setId(caja.getId());
        dto.setAbierta(true);
        dto.setFechaApertura(caja.getFechaApertura());
        dto.setEfectivoInicial(caja.getEfectivoInicial());
        dto.setVentasEfectivo(efectivoIngresado);
        dto.setEfectivoEsperado(esperado);
        
        return dto;
    }

    public CorteCaja cerrarCaja( BigDecimal efectivoReal) {
        CorteCaja caja = corteCajaRepository.findByActivoTrue().
        orElseThrow(() -> new RuntimeException("No hay ninguna caja abierta para cerrar."));
        
        BigDecimal ventasEfectivo = ventaRepository.sumarVentasContadoDesde(
            EstadoVenta.COMPLETADA,
            TipoVenta.CONTADO,
            caja.getFechaApertura()
        );
        BigDecimal creditoEfectivo = ventaRepository.sumarEfectivoRecibidoDesde(
            EstadoVenta.COMPLETADA,
            TipoVenta.CREDITO,
            caja.getFechaApertura()
        );
        BigDecimal abonos = abonoRepository.sumarAbonosDesde(caja.getFechaApertura());
        BigDecimal esperado = caja.getEfectivoInicial().add(ventasEfectivo).add(creditoEfectivo).add(abonos);
        BigDecimal diferencia = efectivoReal.subtract(esperado);

        caja.setFechaCierre(LocalDateTime.now());
        caja.setEfectivoEsperado(esperado);
        caja.setEfectivoReal(efectivoReal);
        caja.setDiferencia(diferencia);
        caja.setActivo(false);

        return corteCajaRepository.save(caja);
    }

    public List<CorteCaja> obtenerHistorial() {
        return corteCajaRepository.findAllByOrderByFechaAperturaDesc();
    }
}
