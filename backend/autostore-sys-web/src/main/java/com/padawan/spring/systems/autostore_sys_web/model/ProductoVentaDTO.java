package com.padawan.spring.systems.autostore_sys_web.model;

//*Objeto de Transferencia de Datos 
// La clase para los productos del carrito
// Esta se encargara de atrapar cada objeto dentro del arreglo "productos" */
public class ProductoVentaDTO {

    private Long id; // El ID del producto
    private Integer cantidad;
    private String precioTipo; // "MOSTRADOR" o "TALLER"

    public Long getId() {
        return this.id;
    }

    public void setId(Long value) {
        this.id = value;
    }



    public Integer getCantidad() {
        return this.cantidad;
    }

    public String getPrecioTipo() {
        return this.precioTipo;
    }


    public void setCantidad(Integer value) {
        this.cantidad = value;
    }

    public void setPrecioTipo(String value) {
        this.precioTipo = value;
    }

}
