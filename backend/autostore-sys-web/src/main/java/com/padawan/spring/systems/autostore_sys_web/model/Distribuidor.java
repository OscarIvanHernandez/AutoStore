package com.padawan.spring.systems.autostore_sys_web.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity 
@Table (name = "distribuidores")
@Data 
public class Distribuidor {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(length = 100)
    private String contacto;

    @Column(nullable = false)
    private Boolean activo = true;

    public Distribuidor() {}

    public Distribuidor(String nombre, String telefono, String contacto) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.contacto = contacto;
        this.activo = true;
    }
}
