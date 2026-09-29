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
import { catchError, EMPTY, of } from 'rxjs';


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
export class Products implements OnInit{
  // Varaibles Producto
  productos: ProductoInterface[] = [];
  productoSeleccionado: ProductoInterface | null = null;
  productoEstadoSeleccionado: EstadoProductoInterface | null = null;
  productoEditar: ProductoInterface = this.resetearFormulario();

  // Varaible para Ajustes de producto
  ajuste: AjusteRequestInterface = this.resetearAjuste();

  // Variable para la carga de los datos
  isLoading: boolean = true;
  hasError: boolean = false;

  // Variables para mensajes
  successMessage: string | null = null;
  errorMessage: string | null = null;

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
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ){}

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

  private showSuccesMessage(message: string, duration: number): void {
    this.successMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    this.errorMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.markForCheck();
    }, duration);
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
    this.isLoading = true;
    this.hasError = false;
    if (!this.textoBusqueda && !this.estadoSeleccionado) {
      this.cargarProductos();
      return;
    }
    this.productoService.buscar({
      q: this.textoBusqueda,
      estado: this.estadoSeleccionado,
    }).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los productos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al buscar productos. (${error.status})`,
            3500
          );
        }
        return of([]);
      })
    ).subscribe((data) => {
      console.log('Filtro de estado:', this.estadoSeleccionado, 'resultados:', data.length);
      this.productos = data;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.productoService.getProductos().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los productos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los productos. (${error.status})`,
            3500
          );
        }
        return of([]);
      })
    ).subscribe ((data) => {
      this.productos = data;
      setTimeout(() =>{
        this.isLoading = false;
        this.cdr.detectChanges()
      },1200);
    });
  }

  private buscarProductos(filtros: { q?: string; marca?: string; categoria?: string; activo?: boolean }): void {
    this.isLoading = true;
    this.hasError = false;
    this.productoService.buscar(filtros).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al buscar los productos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al buscar los productos. (${error.status})`,
            3500
          );
        }
        return of([]);
      })
    ).subscribe((data) => {
        console.log('Productos buscados:', data);
        this.productos = data;
        this.isLoading = false;
        this.cdr.markForCheck();
    });
  }

  guardarProducto(producto: ProductoInterface) {
    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;
    this.hasError = false;
    this.productoService.crear(producto).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al guardar el producto: ', error);
        if (error.status === 0){
          this.cerrarModal();
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.cerrarModal();
          this.showErrorMessage(
            `Ocurrió un error al guardar los cambios. (${error.status})`,
            3500
          );
        }
        return EMPTY;
      })
    ).subscribe((data) => {
        // Se añade el nuevo producto
        this.productos.push(data);
        this.cerrarModal();
        this.isLoading = false;
        this.showSuccesMessage(
          'Nuevo producto agregado!.',
          3500
        );
    });
  }

  editarProducto(producto: ProductoInterface) {
    if(!producto || !producto.id) return;

    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;
    this.hasError = false;

    this.productoService.actualizar(producto.id, producto).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los productos: ', error);
        if (error.status === 0){
          this.cerrarModalEditar();
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.cerrarModalEditar();
          this.showErrorMessage(
            `Ocurrió un error al guardar los cambios. (${error.status})`,
            3500
          );
        }
        return EMPTY
      })
    ).subscribe((data) => {
      const index = this.productos.findIndex(p => p.id === data.id);
      if(index !== -1){
        this.productos[index] = data;
      }
      this.cerrarModalEditar();
      this.isLoading = false;
      this.showSuccesMessage(
        'El producto fue editado correctamente.',
        3500
      );
    });
  }

  guardarAjusteStock(producto: ProductoInterface, ajuste: AjusteRequestInterface): void {
    if(!producto || !producto.id) return;

    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;
    this.hasError = false;
    this.productoService.ajustarStock(producto.id, ajuste).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al guardar el producto: ', error);
        if (error.status === 0){
          this.cerrarModalStock();
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.cerrarModalStock();
          this.showErrorMessage(
            `Ocurrió un error al guardar los cambios. (${error.status})`,
            3500
          );
        }
        return EMPTY
      })
    ).subscribe((data) => {
      const index = this.productos.findIndex(p => p.id === data.id);
      if(index !== -1){
        this.productos[index] = data;
      }
      this.cerrarModalStock();
      this.isLoading = false;
      if (ajuste.tipo === 'ENTRADA') {
        this.showSuccesMessage(
          `Ajuste exitoso: Agregado(s) ${ajuste.cantidad} en inventario de "${data.nombre}"`,
          8000
        );
      } else {
        this.showSuccesMessage(
          `Ajuste exitoso: Retirado(s) ${ajuste.cantidad} en inventario de "${data.nombre}"`,
          8000
        );
      }
    });
  }

  cambiarEstado(productoEstado: EstadoProductoInterface): void {
    if(!productoEstado || !productoEstado.id) return;

    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;
    this.hasError = false;

    this.productoService.actualizarEstado(productoEstado).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al guardar cambios: ', error);
        if (error.status === 0){
          this.cerrarModalAlternar();
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.cerrarModalAlternar();
          this.showErrorMessage(
            `Ocurrió un error al guardar los cambios. (${error.status})`,
            3500
          );
        }
        return EMPTY
      })
    ).subscribe((data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== -1){
          this.productos[index] = data;
        }
        const accion = data.activo ? 'activado' : 'desactivado';
        this.cerrarModalAlternar();
        this.isLoading = false;
        this.showSuccesMessage(
          `Producto "${data.nombre}" ${accion} con éxito.`,
          5000
        );
    });
  }

}
