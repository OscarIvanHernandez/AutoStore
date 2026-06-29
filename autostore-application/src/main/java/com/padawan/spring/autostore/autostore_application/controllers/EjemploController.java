package com.padawan.spring.autostore.autostore_application.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class EjemploController {
    
    @GetMapping("/detalles_info")    

    public String info(){         
        return "detalles_info";
    }
}
