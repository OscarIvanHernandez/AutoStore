package com.padawan.spring.systems.autostore_sys_web.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

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
  @DisplayName ("Debe buscar productos por marca")
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

  @Test 
  @DisplayName ("Debe buscar productos por marca general")
  void buscar_ProductosEspecificacionMarcaGeneral() {
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

    String specMarca = "Gonher";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, specMarca, null, null)
    );

    assertThat(resultado).hasSize(3)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("GP-01", "GP-11", "GP-3645");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe buscar productos por categoria")
  void buscar_ProductosEspecificacionCategoria() {
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

    String sepCategoria = "motor a gasolina";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, sepCategoria, null)
    );

    assertThat(resultado).hasSize(1)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("15w - 30");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe buscar productos por estado activo")
  void buscar_ProductosEspecificacionActivo() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    ProductoCategoria categoria2 = crearCategoria("Motor a gasolina");
    entityManager.persist(categoria2);
    ProductoMarca marca2 = crearMarca("Motorcraft");
    entityManager.persist(marca2);
    
    Producto prod1 = crearProducto("GP-01", categoria, marca);
    prod1.setActivo(false);
    entityManager.persist(prod1);
    Producto prod2 = crearProducto("GP-11", categoria, marca);
    prod2.setActivo(false);
    entityManager.persist(prod2);
    Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
    entityManager.persist(prod3);
    entityManager.flush();

    String estado = "activo";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, null, estado)
    );

    assertThat(resultado).hasSize(1)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("15w - 30");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe buscar productos por estado inactivo")
  void buscar_ProductosEspecificacionInactivo() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    ProductoCategoria categoria2 = crearCategoria("Motor a gasolina");
    entityManager.persist(categoria2);
    ProductoMarca marca2 = crearMarca("Motorcraft");
    entityManager.persist(marca2);
    
    Producto prod1 = crearProducto("GP-01", categoria, marca);
    prod1.setActivo(false);
    entityManager.persist(prod1);
    Producto prod2 = crearProducto("GP-11", categoria, marca);
    prod2.setActivo(false);
    entityManager.persist(prod2);
    Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
    entityManager.persist(prod3);
    entityManager.flush();

    String estado = "inactivo";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, null, estado)
    );

    assertThat(resultado).hasSize(2)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("GP-01", "GP-11");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isFalse());
  };

  @ParameterizedTest
  @ValueSource(strings = {"true", "TRUE", "1", "  AcTiVo  "})
  @DisplayName("Debe reconocer alias y mayúsculas para filtrar productos activos")
  void buscar_ProductosEstadoActivo_Alias(String estado) {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    Producto activo = crearProducto("Activo", categoria, marca);
    Producto inactivo = crearProducto("Inactivo", categoria, marca);
    inactivo.setActivo(false);
    entityManager.persist(activo);
    entityManager.persist(inactivo);
    entityManager.flush();

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, null, estado)
    );

    assertThat(resultado)
        .extracting(Producto::getNombre)
        .containsExactly("Activo");
  };

  @ParameterizedTest
  @ValueSource(strings = {"false", "FALSE", "0", "  InAcTiVo  "})
  @DisplayName("Debe reconocer alias y mayúsculas para filtrar productos inactivos")
  void buscar_ProductosEstadoInactivo_Alias(String estado) {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    Producto activo = crearProducto("Activo", categoria, marca);
    Producto inactivo = crearProducto("Inactivo", categoria, marca);
    inactivo.setActivo(false);
    entityManager.persist(activo);
    entityManager.persist(inactivo);
    entityManager.flush();

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, null, estado)
    );

    assertThat(resultado)
        .extracting(Producto::getNombre)
        .containsExactly("Inactivo");
  };

  @Test
  @DisplayName("Debe ignorar valores de estado desconocidos y devolver productos activos e inactivos")
  void buscar_ProductosEstadoDesconocido() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    Producto activo = crearProducto("Activo", categoria, marca);
    Producto inactivo = crearProducto("Inactivo", categoria, marca);
    inactivo.setActivo(false);
    entityManager.persist(activo);
    entityManager.persist(inactivo);
    entityManager.flush();

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(null, null, null, "todos")
    );

    assertThat(resultado)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("Activo", "Inactivo");
  };

  @Test
  @DisplayName("La búsqueda global debe encontrar coincidencias en marca y categoría")
  void buscar_ProductosTextoGlobalEnMarcaYCategoria() {
    ProductoCategoria motor = crearCategoria("Motor");
    entityManager.persist(motor);
    ProductoCategoria transmision = crearCategoria("Transmision");
    entityManager.persist(transmision);
    ProductoMarca gonher = crearMarca("Gonher");
    entityManager.persist(gonher);
    ProductoMarca motorcraft = crearMarca("Motorcraft");
    entityManager.persist(motorcraft);

    entityManager.persist(crearProducto("Producto por categoría", motor, gonher));
    entityManager.persist(crearProducto("Producto por marca", transmision, motorcraft));
    entityManager.persist(crearProducto("Sin coincidencia", transmision, gonher));
    entityManager.flush();

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros("  MOTOR  ", null, null, null)
    );

    assertThat(resultado)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("Producto por categoría", "Producto por marca");
  };

  @Test 
  @DisplayName ("Debe buscar un producto por varias especificaciones")
  void buscar_UnProductoEspecificaciones() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    ProductoCategoria categoria2 = crearCategoria("Motor a gasolina");
    entityManager.persist(categoria2);
    ProductoMarca marca2 = crearMarca("Motorcraft");
    entityManager.persist(marca2);
    
    Producto prod1 = crearProducto("GP-01", categoria, marca);
    prod1.setActivo(false);
    entityManager.persist(prod1);
    Producto prod2 = crearProducto("GP-11", categoria, marca);
    prod2.setActivo(false);
    entityManager.persist(prod2);
    Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
    entityManager.persist(prod3);
    entityManager.flush();

    String q = "15w - 30";
    String specMarca = "Motorcraft";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(q, specMarca, null, null)
    );

    assertThat(resultado).hasSize(1)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("15w - 30");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe regresar una lista vacia de productos cuando no existen al buscar")
  void buscar_ProductosInexistentesEspecificaciones() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    ProductoCategoria categoria2 = crearCategoria("Motor a gasolina");
    entityManager.persist(categoria2);
    ProductoMarca marca2 = crearMarca("Motorcraft");
    entityManager.persist(marca2);
    
    Producto prod1 = crearProducto("GP-01", categoria, marca);
    prod1.setActivo(false);
    entityManager.persist(prod1);
    Producto prod2 = crearProducto("GP-11", categoria, marca);
    prod2.setActivo(false);
    entityManager.persist(prod2);
    Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
    entityManager.persist(prod3);
    entityManager.flush();

    String q = "automatica";

    List<Producto> resultado = productoRepository.findAll(
            ProductoSpecification.conFiltros(q, null, null, null)
    );

    assertThat(resultado).hasSize(0);
    assertThat(resultado).isEmpty();
  };

  @Test 
  @DisplayName ("Debe buscar un producto para la venta")
  void buscar_UnProductoSearchEnVenta() {
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
    prod2.setActivo(false);
    entityManager.persist(prod2);
    Producto prod3 = crearProducto("15w - 30", categoria2, marca2);
    entityManager.persist(prod3);
    entityManager.flush();

    String q = "gp";

    List<Producto> resultado = productoRepository.searchProductos(q);

    assertThat(resultado).hasSize(1)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("GP-01");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe buscar productos para la venta")
  void buscar_ProductosSearchEnVenta() {
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

    String q = "gp";

    List<Producto> resultado = productoRepository.searchProductos(q);

    assertThat(resultado).hasSize(2)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("GP-01", "GP-11");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };

  @Test 
  @DisplayName ("Debe buscar productos para la venta")
  void buscar_OtrosProductosSearchEnVenta() {
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
    Producto prod4 = crearProducto("20w - 40", categoria2, marca2);
    entityManager.persist(prod4);
    entityManager.flush();

    String q = "w";

    List<Producto> resultado = productoRepository.searchProductos(q);

    assertThat(resultado).hasSize(2)
        .extracting(Producto::getNombre)
        .containsExactlyInAnyOrder("15w - 30", "20w - 40");
    assertThat(resultado).allSatisfy(producto -> assertThat(producto.getActivo()).isTrue());
  };
  // ==========================
  // 🧹 Stock bajo
  // ==========================

  @Test
  @DisplayName("Debe encontrar productos activos con stock igual o menor al mínimo")
  void encontrar_ProductosConStockBajo() {
    ProductoCategoria categoria = crearCategoria("Filtros");
    entityManager.persist(categoria);
    ProductoMarca marca = crearMarca("Gonher");
    entityManager.persist(marca);

    Producto stockBajo = crearProducto("Filtro bajo", categoria, marca);
    stockBajo.setStockActual(2);
    entityManager.persist(stockBajo);

    Producto stockEnMinimo = crearProducto("Filtro al mínimo", categoria, marca);
    stockEnMinimo.setStockActual(5);
    entityManager.persist(stockEnMinimo);

    Producto stockSuficiente = crearProducto("Filtro suficiente", categoria, marca);
    stockSuficiente.setStockActual(6);
    entityManager.persist(stockSuficiente);

    Producto inactivo = crearProducto("Filtro inactivo", categoria, marca);
    inactivo.setStockActual(1);
    inactivo.setActivo(false);
    entityManager.persist(inactivo);
    entityManager.flush();

    List<com.padawan.spring.systems.autostore_sys_web.model.DashboardDTO.ProductoStockBajo> resultado =
        productoRepository.findProductosConStockBajo();

    assertThat(resultado)
        .extracting(producto -> producto.nombre)
        .containsExactly("Filtro bajo", "Filtro al mínimo");
    assertThat(resultado)
        .extracting(producto -> producto.stock)
        .containsExactly(2, 5);
    assertThat(resultado)
        .extracting(producto -> producto.stockMinimo)
        .containsExactly(5, 5);
  };
};
