package com.padawan.spring.systems.autostore_sys_web.controller;

import com.padawan.spring.systems.autostore_sys_web.service.ProductoService;
import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;


@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:4200") // Permitir solicitudes desde el frontend
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // GET /api/productos -> Listar todos
    @GetMapping
    public List<Producto> getAll(){
        return productoService.listarTodos();
    }

    // GET /api/productos -> Listar todos los activos
    @GetMapping("/activos")
    public List<Producto> getAllActives(){
        return productoService.listarActivos();
    }

    // GET /api/productos/{id} -> Obtener un producto por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable Long id){
        return productoService.obtenerPorId(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/productos/search?q=xxx --> Buscar productos
    @GetMapping("/search")
    public List<Producto> search(@RequestParam("q") String query) {
        return productoService.buscar(query);
    }

    // GET /api/productos -> Crear un nuevo producto
    @PostMapping
    public ResponseEntity<Producto> create(@RequestBody Producto producto) {
        Producto createdProducto = productoService.guardar(producto);
        return ResponseEntity.ok(createdProducto);
    }

    // PUT /api/productos/{id} -> Actualizar un producto existente
    @PutMapping("/{id}/editar")
    public ResponseEntity<Producto> update(@PathVariable Long id, @RequestBody Producto producto) {
        return productoService.obtenerPorId(id).map(productoExistente -> {
            // Actualizamos los campos permitidos
            productoExistente.setNombre(producto.getNombre());
            productoExistente.setMarca(producto.getMarca());
            productoExistente.setCategoria(producto.getCategoria());
            productoExistente.setProveedor(producto.getProveedor());
            productoExistente.setPrecioCompra(producto.getPrecioCompra());
            productoExistente.setPrecioVentaMostrador(producto.getPrecioVentaMostrador());
            productoExistente.setPrecioVentaTaller(producto.getPrecioVentaTaller());
            productoExistente.setStockActual(producto.getStockActual());
            productoExistente.setStockMinimo(producto.getStockMinimo());
            productoExistente.setFoto(producto.getFoto());
            
            Producto actualizado = productoService.guardar(productoExistente);
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/productos/cambiar-estado/{id} -> Actualizar un el estado de un producto
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Producto> updateState(@PathVariable Long id) {
        return productoService.obtenerPorId(id).map(productoExistente -> {
            // Actualizamos el campo
            productoExistente.setActivo(!productoExistente.getActivo());
            
            Producto actualizado = productoService.guardar(productoExistente);
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/productos/{id} -> Eliminar un producto existente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean eliminado = productoService.eliminarLogico(id);
        if (eliminado) {
            return ResponseEntity.noContent().build(); // Código 204 (Todo bien, sin contenido)
        }
        return ResponseEntity.notFound().build(); // Código 404 si el ID no existía
    }

    //POST /api/productos/{id}/ajustar-stock (ISSUE-07)
    @PostMapping("/{id}/ajustar-stock")
    public ResponseEntity<?> ajustarStock(@PathVariable Long id, @RequestBody AjusteRequest request){
        try {
            // Convertir el String del JSON a un Enum
            com.padawan.spring.systems.autostore_sys_web.model.TipoMovimiento tipo = 
                com.padawan.spring.systems.autostore_sys_web.model.TipoMovimiento.valueOf(request.getTipo().toUpperCase());
            
            Producto productoActualizado = productoService.ajustarStock(id, tipo, request.getCantidad(), request.getMotivo());
            return ResponseEntity.ok(productoActualizado);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());  
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Clase auxiliar (DTO) para mapear el JSON que llega del Frontend
    public static class AjusteRequest{
        private String tipo;
        private Integer cantidad;
        private String motivo;

        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public String getMotivo() { return motivo; }
        public void setMotivo(String motivo) { this.motivo = motivo; }

    }
}
