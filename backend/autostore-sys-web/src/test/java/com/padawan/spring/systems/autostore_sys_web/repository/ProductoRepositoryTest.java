package com.padawan.spring.systems.autostore_sys_web.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.http.ResponseEntity;

import com.padawan.spring.systems.autostore_sys_web.model.Producto;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoCategoria;
import com.padawan.spring.systems.autostore_sys_web.model.ProductoMarca;
import com.padawan.spring.systems.autostore_sys_web.repository.specs.ProductoSpecification;

@DataJpaTest 
public class ProductoRepositoryTest {

    @Autowired 
    private ProductoRepository productoRepository;

    @Autowired 
    private TestEntityManager entityManager;

    private ProductoCategoria crearCategoria(String nombre) {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre(nombre);
        categoria.setActivo(true);
        return categoria;
    };

    private ProductoMarca crearMarca(String nombre) {
        ProductoMarca marca = new ProductoMarca();
        marca.setNombre(nombre);
        marca.setActivo(true);
        return marca;
    };

    private Producto crearProducto(String nombre, ProductoCategoria categoria, ProductoMarca marca) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setMarca(marca);
        producto.setPrecioCompra(new BigDecimal("80.00"));
        producto.setPrecioVentaMostrador(new BigDecimal("120.00"));
        producto.setPrecioVentaTaller(BigDecimal.ZERO);
        producto.setStockActual(15);
        producto.setStockMinimo(5);
        producto.setActivo(true);
        return producto;
    };

    // ==========================
    // 🧹 Obtener
    // ==========================
    @Test 
    @DisplayName ("Debe retornar todos los productos")
    void obtener_TodosProductos() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        entityManager.persist(categoria);

        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        entityManager.persist(marca);

        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        Producto prod2 = crearProducto("GP-11", categoria, marca);
        entityManager.persist(prod2);
        Producto prod3 = crearProducto("GP-3645", categoria, marca);
        entityManager.persist(prod3);
        entityManager.flush();
        
        List<Producto> resultado = productoRepository.findAll();

        assertThat(resultado).hasSize(3)
            .extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("GP-01", "GP-11", "GP-3645");
        assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
    };

    @Test 
    @DisplayName ("Debe retornar todos los productos activos")
    void obtener_TodosProductosActivos() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        entityManager.persist(categoria);

        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        entityManager.persist(marca);

        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        Producto prod2 = crearProducto("GP-11", categoria, marca);
        entityManager.persist(prod2);
        Producto prod3 = crearProducto("GP-3645", categoria, marca);
        prod3.setActivo(false);
        entityManager.persist(prod3);
        entityManager.flush();
        
        List<Producto> resultado = productoRepository.findByActivoTrue();

        assertThat(resultado).hasSize(2)
            .extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("GP-01", "GP-11");
        assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
    };

        @Test 
    @DisplayName ("Debe retornar el producto por su ID")
    void obtener_ProductoPorId() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        entityManager.persist(categoria);

        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        entityManager.persist(marca);

        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        entityManager.flush();
        
        Optional<Producto> resultado = productoRepository.findById(prod1.getId());

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNombre()).isEqualTo("GP-01");
        assertThat(resultado.get().getCategoria().getNombre()).isEqualTo("Filtros");
        assertThat(resultado.get().getMarca().getNombre()).isEqualTo("Gonher");
    };

    @Test
    @DisplayName("Debe retornar vacío cuando el ID no existe")
    void findById_NoEncontrado() {
        Optional<Producto> resultado = productoRepository.findById(999L);

        assertThat(resultado).isEmpty();
    };
    // ==========================
    // 🧹 Buscar Productos
    // ==========================
    @Test 
    @DisplayName ("Debe buscar productos por especificación")
    void buscar_ProductosEspecificacionNombre() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        entityManager.persist(categoria);

        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        entityManager.persist(marca);

        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        Producto prod2 = crearProducto("GP-11", categoria, marca);
        entityManager.persist(prod2);
        Producto prod3 = crearProducto("GP-3645", categoria, marca);
        entityManager.persist(prod3);
        entityManager.flush();

        String q = "gp-01";

        List<Producto> resultado = productoRepository.findAll(
                ProductoSpecification.conFiltros(q, null, null, null)
        );

        assertThat(resultado).hasSize(1)
            .extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("GP-01");
        assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
    };

    @Test 
    @DisplayName ("Debe buscar productos por especificación")
    void buscar_ProductosEspecificacionNombreGeneral() {
        ProductoCategoria categoria = new ProductoCategoria();
        categoria.setNombre("Filtros");
        entityManager.persist(categoria);

        ProductoMarca marca = new ProductoMarca();
        marca.setNombre("Gonher");
        entityManager.persist(marca);

        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        Producto prod2 = crearProducto("GP-11", categoria, marca);
        entityManager.persist(prod2);
        Producto prod3 = crearProducto("GP-3645", categoria, marca);
        entityManager.persist(prod3);
        entityManager.flush();

        String q = "gp";

        List<Producto> resultado = productoRepository.findAll(
                ProductoSpecification.conFiltros(q, null, null, null)
        );

        assertThat(resultado).hasSize(3)
            .extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("GP-01", "GP-11", "GP-3645");
        assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
    };

    @Test 
    @DisplayName ("Debe buscar productos por especificación")
    void buscar_ProductosEspecificacionMarca() {

        ProductoCategoria categoria = crearCategoria("Filtros");
        entityManager.persist(categoria);
        ProductoMarca marca = crearMarca("Gonher");
        entityManager.persist(marca);

        ProductoCategoria categoria2 = crearCategoria("Motor a gasolina");
        entityManager.persist(categoria2);
        ProductoMarca marca2 = crearMarca("Motorcraft");
        entityManager.persist(marca2);
        
        Producto prod1 = crearProducto("GP-01", categoria, marca);
        entityManager.persist(prod1);
        Producto prod2 = crearProducto("GP-11", categoria, marca);
        entityManager.persist(prod2);
        Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
        entityManager.persist(prod3);
        entityManager.flush();

        String sepMarca = "Gonher";

        List<Producto> resultado = productoRepository.findAll(
                ProductoSpecification.conFiltros(null, sepMarca, null, null)
        );

        assertThat(resultado).hasSize(2)
            .extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("GP-01", "GP-11");
        assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
    };
};
