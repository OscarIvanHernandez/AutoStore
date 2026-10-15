import {
  AjusteRequestInterface,
  CatalogoProductoInterface,
  EstadoProductoInterface,
  ProductoInterface
} from './../../../services/autostore.models';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {ProductoService } from '../../../services/autostore.product-service';
import { CatalogoProductoService } from '../../../services/autostore.product-catalog-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgregarProducto } from './modales/agregar-producto/agregar-producto';
import { EditarProducto } from './modales/editar-producto/editar-producto';
import { InventarioProducto } from './modales/inventario-producto/inventario-producto';
import { EstadoProducto } from './modales/estado-producto/estado-producto';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    AgregarProducto,
    EditarProducto,
    InventarioProducto,
    EstadoProducto
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products extends BaseComponent implements OnInit{
  // Varaibles Producto
  productos: ProductoInterface[] = [];
  marcas: CatalogoProductoInterface[] = [];
  categorias: CatalogoProductoInterface[] = [];
  productoSeleccionado: ProductoInterface | null = null;
  productoEstadoSeleccionado: EstadoProductoInterface | null = null;
  productoEditar: ProductoInterface = this.resetearFormulario();

  // Varaible para Ajustes de producto
  ajuste: AjusteRequestInterface = this.resetearAjuste();

  // Variable para la carga de los datos
  hasLoadedProducts: boolean = false;

  // Variables MODAL
  // Crear producto
  mostrarModal: boolean = false;
  // Cambiar Stock
  mostrarModalStock: boolean = false;
  // Editar producto
  mostrarModalEditar: boolean = false;
  // Alternar estado
  mostrarModalAlternar: boolean = false;
  marcaEditandoId: number | null = null;
  categoriaEditandoId: number | null = null;
  nombreMarca = '';
  nombreCategoria = '';

  // Variables para los filtro de busqueda
  textoBusqueda: string  = '';
  estadoSeleccionado: string  = '';
  private filtrosIniciales: { q?: string; marca?: string; categoria?: string; activo?: boolean } | null = null;


  constructor(
    private productoService: ProductoService,
    private catalogoService: CatalogoProductoService,
    cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ){ super(cdr)}

  ngOnInit(): void{
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      const marca = params['marca'];
      const categoria = params['categoria'];
      const estado = params['estado'];
      const activoParam = params['activo'];
      const activo = activoParam === undefined ? undefined : activoParam === 'true';

      if (q || marca || categoria || estado || activoParam !== undefined) {
        if (estado?.trim()) {
          this.estadoSeleccionado = estado.trim();
        }

        this.filtrosIniciales = { q, marca, categoria, activo };
        this.buscarProductos(this.filtrosIniciales);
      } else {
        this.filtrosIniciales = null;
        this.cargarProductos();
      }
    });
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.cargarRecurso('marcas', this.catalogoService.obtenerMarcas(), (marcas) => {
      this.marcas = marcas;
    }, 'marcas');
    this.cargarRecurso('categorias', this.catalogoService.obtenerCategorias(), (categorias) => {
      this.categorias = categorias;
    }, 'categorías');
  }

  private resetearFormulario(): ProductoInterface{
    return{
      nombre:'',
      marca: '',
      marcaId: undefined,
      categoria: '',
      categoriaId: undefined,
      proveedor: '',
      precioCompra: 0,
      precioVentaMostrador: 0,
      precioVentaTaller: 0,
      stockActual: 0,
      stockMinimo: 0
    }
  }

  private resetearAjuste(): AjusteRequestInterface{
    return{
    tipo: 'ENTRADA',
    cantidad: 0,
    motivo: ''
    }
  }

  abrirModalCrearProducto() {
    this.successMessage = null;
    this.errorMessage = null;
    this.mostrarModal = true;
  }

  guardarMarca(): void {
    const nombre = this.nombreMarca.trim();
    if (!nombre) return;

    const marca = this.marcas.find(item => item.id === this.marcaEditandoId);
    if (marca?.id !== undefined) {
      this.ejecutarMutacion(
        this.catalogoService.actualizarMarca({ ...marca, nombre }),
        'actualizar la marca',
        (actualizada) => {
          this.actualizarCatalogo(this.marcas, actualizada, 'marcas');
          this.productos = this.productos.map(producto => producto.marcaId === actualizada.id
            ? { ...producto, marca: actualizada.nombre }
            : producto);
          this.cancelarEdicionMarca();
          this.showSuccessMessage('Marca actualizada correctamente.');
        }
      );
      return;
    }

    this.ejecutarMutacion(
      this.catalogoService.crearMarca({ nombre, activo: true }),
      'crear la marca',
      (nueva) => {
        this.marcas = [...this.marcas, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.nombreMarca = '';
        this.showSuccessMessage('Marca creada correctamente.');
      }
    );
  }

  editarMarca(marca: CatalogoProductoInterface): void {
    if (marca.id === undefined) return;
    this.marcaEditandoId = marca.id;
    this.nombreMarca = marca.nombre;
  }

  cancelarEdicionMarca(): void {
    this.marcaEditandoId = null;
    this.nombreMarca = '';
  }

  alternarEstadoMarca(marca: CatalogoProductoInterface): void {
    if (marca.id === undefined) return;
    if (marca.activo) {
      this.ejecutarMutacion(this.catalogoService.desactivarMarca(marca.id), 'desactivar la marca', () => {
        this.actualizarCatalogo(this.marcas, { ...marca, activo: false }, 'marcas');
        this.showSuccessMessage('Marca desactivada. Los productos asociados se conservan.');
      });
      return;
    }

    this.ejecutarMutacion(
      this.catalogoService.actualizarMarca({ ...marca, activo: true }),
      'activar la marca',
      (actualizada) => {
        this.actualizarCatalogo(this.marcas, actualizada, 'marcas');
        this.showSuccessMessage('Marca activada correctamente.');
      }
    );
  }

  guardarCategoria(): void {
    const nombre = this.nombreCategoria.trim();
    if (!nombre) return;

    const categoria = this.categorias.find(item => item.id === this.categoriaEditandoId);
    if (categoria?.id !== undefined) {
      this.ejecutarMutacion(
        this.catalogoService.actualizarCategoria({ ...categoria, nombre }),
        'actualizar la categoría',
        (actualizada) => {
          this.actualizarCatalogo(this.categorias, actualizada, 'categorias');
          this.productos = this.productos.map(producto => producto.categoriaId === actualizada.id
            ? { ...producto, categoria: actualizada.nombre }
            : producto);
          this.cancelarEdicionCategoria();
          this.showSuccessMessage('Categoría actualizada correctamente.');
        }
      );
      return;
    }

    this.ejecutarMutacion(
      this.catalogoService.crearCategoria({ nombre, activo: true }),
      'crear la categoría',
      (nueva) => {
        this.categorias = [...this.categorias, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.nombreCategoria = '';
        this.showSuccessMessage('Categoría creada correctamente.');
      }
    );
  }

  editarCategoria(categoria: CatalogoProductoInterface): void {
    if (categoria.id === undefined) return;
    this.categoriaEditandoId = categoria.id;
    this.nombreCategoria = categoria.nombre;
  }

  cancelarEdicionCategoria(): void {
    this.categoriaEditandoId = null;
    this.nombreCategoria = '';
  }

  alternarEstadoCategoria(categoria: CatalogoProductoInterface): void {
    if (categoria.id === undefined) return;
    if (categoria.activo) {
      this.ejecutarMutacion(this.catalogoService.desactivarCategoria(categoria.id), 'desactivar la categoría', () => {
        this.actualizarCatalogo(this.categorias, { ...categoria, activo: false }, 'categorias');
        this.showSuccessMessage('Categoría desactivada. Los productos asociados se conservan.');
      });
      return;
    }

    this.ejecutarMutacion(
      this.catalogoService.actualizarCategoria({ ...categoria, activo: true }),
      'activar la categoría',
      (actualizada) => {
        this.actualizarCatalogo(this.categorias, actualizada, 'categorias');
        this.showSuccessMessage('Categoría activada correctamente.');
      }
    );
  }

  private actualizarCatalogo(
    catalogo: CatalogoProductoInterface[],
    actualizada: CatalogoProductoInterface,
    propiedad: 'marcas' | 'categorias'
  ): void {
    const actualizado = catalogo.map(item => item.id === actualizada.id ? actualizada : item)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (propiedad === 'marcas') {
      this.marcas = actualizado;
    } else {
      this.categorias = actualizado;
    }
  }

  reintentarCargaCatalogo(tipo: 'marcas' | 'categorias'): void {
    if (tipo === 'marcas') {
      this.cargarRecurso('marcas', this.catalogoService.obtenerMarcas(), (marcas) => {
        this.marcas = marcas;
      }, 'marcas');
    } else {
      this.cargarRecurso('categorias', this.catalogoService.obtenerCategorias(), (categorias) => {
        this.categorias = categorias;
      }, 'categorías');
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  abrirModalEditarProducto(producto: ProductoInterface) {
    this.productoEditar = {...producto};
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
  }

  abrirModalAlternarEstado(producto: ProductoInterface) {
    this.productoSeleccionado = producto;
    this.productoEstadoSeleccionado = {
      id: producto.id,
      nombre: producto.nombre,
      activo: producto.activo ?? true,
    };

    this.mostrarModalAlternar = true;
  }

  cerrarModalAlternar() {
    this.productoEstadoSeleccionado = null;
    this.mostrarModalAlternar = false;
  }

  abrirModalAjustarStock(producto: ProductoInterface) {
    this.productoSeleccionado = producto;
    this.mostrarModalStock = true;
  }

  cerrarModalStock() {
    this.mostrarModalStock = false;
  }

  filtrarProductos(): void{
    this.cargarRecurso('filtroProductos', this.productoService.buscar({
      q: this.textoBusqueda,
      estado: this.estadoSeleccionado
    }), (data) => {
      this.productos = data;
      this.hasLoadedProducts = true;
    });
  }

  cargarProductos(): void {
    this.cargarRecurso('productos', this.productoService.getProductos(), (data) => {
      this.productos = data;
      this.hasLoadedProducts = true;
    });
  }

  private buscarProductos(filtros: { q?: string; marca?: string; categoria?: string; activo?: boolean }): void {
      this.cargarRecurso('buscarProductos', this.productoService.buscar(filtros), (data) => {
        this.productos = data;
        this.hasLoadedProducts = true;
      });
  }

  get cargandoProductos(): boolean {
    return this.loadingStates['productos']
      || this.loadingStates['filtroProductos']
      || this.loadingStates['buscarProductos'];
  }

  get catalogosActivosDisponibles(): boolean {
    return this.marcas.some(marca => marca.activo)
      && this.categorias.some(categoria => categoria.activo);
  }

  reintentarBusquedaInicial(): void {
    if (this.filtrosIniciales) {
      this.buscarProductos(this.filtrosIniciales);
    }
  }

  guardarProducto(producto: ProductoInterface) {
    this.ejecutarMutacion(this.productoService.crear(producto), 'guardar el producto', (data) => {
      this.productos.push(data);
      this.cerrarModal();
      this.showSuccessMessage('Nuevo producto agregado.', 3500);
    });
  }

  editarProducto(producto: ProductoInterface) {
    if(!producto || !producto.id) return;

    this.ejecutarMutacion(this.productoService.actualizar(producto.id, producto), 'guardar los cambios', (data) => {
      const index = this.productos.findIndex(p => p.id === data.id);
      if(index !== -1){
        this.productos[index] = data;
      }
      this.cerrarModalEditar();
      this.showSuccessMessage('El producto fue editado correctamente.', 3500);
    });
  }

  guardarAjusteStock(producto: ProductoInterface, ajuste: AjusteRequestInterface): void {
    if(!producto || !producto.id) return;

    this.ejecutarMutacion(this.productoService.ajustarStock(producto.id, ajuste), 'guardar el ajuste de inventario', (data) => {
      const index = this.productos.findIndex(p => p.id === data.id);
      if(index !== -1){
        this.productos[index] = data;
      }
      this.cerrarModalStock();
      if (ajuste.tipo === 'ENTRADA') {
        this.showSuccessMessage(
          `Ajuste exitoso: Agregado(s) ${ajuste.cantidad} en inventario de "${data.nombre}"`,
          8000
        );
      } else {
        this.showSuccessMessage(
          `Ajuste exitoso: Retirado(s) ${ajuste.cantidad} en inventario de "${data.nombre}"`,
          8000
        );
      }
    });
  }

  cambiarEstado(productoEstado: EstadoProductoInterface): void {
    if(!productoEstado || !productoEstado.id) return;

    this.ejecutarMutacion(this.productoService.actualizarEstado(productoEstado), 'guardar el cambio de estado', (data) => {
      const index = this.productos.findIndex(p => p.id === data.id);
      if(index !== -1){
        this.productos[index] = data;
      }
      const accion = data.activo ? 'activado' : 'desactivado';
      this.cerrarModalAlternar();
      this.showSuccessMessage(`Producto "${data.nombre}" ${accion} con éxito.`, 5000);
    });
  }

}
