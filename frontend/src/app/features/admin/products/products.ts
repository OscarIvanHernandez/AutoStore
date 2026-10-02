import { AjusteRequestInterface, EstadoProductoInterface, ProductoInterface } from './../../../services/autostore.models';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {ProductoService } from '../../../services/autostore.product-service';
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

  // Variables para los filtro de busqueda
  textoBusqueda: string  = '';
  estadoSeleccionado: string  = '';


  constructor(
    private productoService: ProductoService,
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

        this.buscarProductos({ q, marca, categoria, activo });
      } else {
        this.cargarProductos();
      }
    });
  }

  private resetearFormulario(): ProductoInterface{
    return{
      nombre:'',
      marca: '',
      categoria: '',
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
    this.errorMessage = null;
    if (!this.textoBusqueda && !this.estadoSeleccionado) {
      this.cargarProductos();
      return;
    }
    this.isLoading = true;
    this.productoService.buscar({
      q: this.textoBusqueda,
      estado: this.estadoSeleccionado,
    }).pipe(
      catchError((error) => {
        this.registrarErrorCarga(error, 'buscar productos');
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((data) => {
      console.log('Filtro de estado:', this.estadoSeleccionado, 'resultados:', data.length);
      this.productos = data;
      this.hasLoadedProducts = true;
    });
  }

  cargarProductos(): void {
    this.errorMessage = null;
    this.initialLoadError = null;
    this.isLoading = true;
    this.productoService.getProductos().pipe(
      catchError((error) => {
        this.registrarErrorCarga(error, 'cargar los productos');
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((data) => {
      this.productos = data;
      this.hasLoadedProducts = true;
    });
  }

  private buscarProductos(filtros: { q?: string; marca?: string; categoria?: string; activo?: boolean }): void {
    this.errorMessage = null;
    this.initialLoadError = null;
    this.isLoading = true;
    this.productoService.buscar(filtros).pipe(
      catchError((error) => {
        this.registrarErrorCarga(error, 'buscar los productos');
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((data) => {
      console.log('Productos buscados:', data);
      this.productos = data;
      this.hasLoadedProducts = true;
    });
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
