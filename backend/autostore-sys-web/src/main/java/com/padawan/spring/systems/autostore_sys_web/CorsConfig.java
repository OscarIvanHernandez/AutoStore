package com.padawan.spring.systems.autostore_sys_web;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a todas las rutas de la API
                        .allowedOrigins("http://localhost:4200") // El puerto de tu Angular
                        // 🔥 Aquí ya incluimos PATCH junto a los demás métodos:
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") 
                        .allowedHeaders("*") // Permite cualquier cabecera
                        .allowCredentials(true);
            }
        };
    }
}