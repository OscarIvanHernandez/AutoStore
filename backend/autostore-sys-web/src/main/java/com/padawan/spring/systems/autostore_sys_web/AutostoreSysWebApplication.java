package com.padawan.spring.systems.autostore_sys_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // Para manejar automaticamente fechas de creacion y actualizacion de entidades
public class AutostoreSysWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutostoreSysWebApplication.class, args);
	}

}
