package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;
import java.util.List;

//*Objeto de Transferencia de Datos 
// Clase principal de Venta
// Esta se encargara de atrapar el JSON general de la venta  */
public class VentaRequestDTO {

    private List<ProductoVentaDTO> productos; // La lista del carrito
    private BigDecimal descuento;
    private String tipoVenta; // "CONTADO" o "CREDITO"
    private Long clienteId;   // Opcional
    private BigDecimal efectivoRecibido;

    public List<ProductoVentaDTO> getProductos() {
        return this.productos;
    }

    public BigDecimal getDescuento() {
        return this.descuento;
    }

    public String getTipoVenta() {
        return this.tipoVenta;
    }

    public Long getClienteId() {
        return this.clienteId;
    }

    public BigDecimal getEfectivoRecibido() {
        return this.efectivoRecibido;
    }

    public void setProductos(List<ProductoVentaDTO> values) {
        this.productos = values;
    }

    public void setDescuento(BigDecimal value) {
        this.descuento = value;
    }

    public void setTipoVenta(String value) {
        this.tipoVenta = value;
    }

    public void setClienteId(Long value) {
        this.clienteId = value;
    }

    public void setEfectivoRecibido(BigDecimal value) {
        this.efectivoRecibido = value;
    }

}
