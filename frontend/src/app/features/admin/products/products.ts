import { AjusteRequestInterface, EstadoProductoInterface, ProductoInterface } from './../../../services/autostore.models';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {ProductoService } from '../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgregarProducto } from './modales/agregar-producto/agregar-producto';
import { EditarProducto } from './modales/editar-producto/editar-producto';
import { InventarioProducto } from './modales/inventario-producto/inventario-producto';
import { EstadoProducto } from './modales/estado-producto/estado-producto';


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

  constructor(private productoService: ProductoService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void{
    this.cargarProductos();
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

  guardarProducto(producto: ProductoInterface) {
    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.crear(producto).subscribe({
      next: (data) => {
        // Se añade el nuevo producto
        this.productos.push(data);
        this.cerrarModal();
        this.successMessage = 'Nuevo producto agregado correctamente.';
        setTimeout(() => {
          this.successMessage = null;
        }, 1500)
      },
      error: (error) => {
        this.cerrarModal();
        console.error('Error al crear el producto: ', error);
        this.errorMessage =`Error al crear el producto: (${error.status}`;
      }
    });
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
        this.productos = productos;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.errorMessage = `Hubo un error al cargar los horarios. (${error.status})`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  editarProducto(producto: ProductoInterface) {
    if(!producto || !producto.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.actualizar(producto.id, producto).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== -1){
          this.productos[index] = data;
        }
        this.successMessage = 'Producto editado correctamente.';
        this.cerrarModalEditar();
        setTimeout(() => {
          this.successMessage = null;
        }, 1500)
      },
      error: (error) => {
        this.cerrarModalEditar();
        console.error('Error al editar el producto: ', error);
        this.errorMessage = `Error al editar el producto: (${error.status})`;
      }
    });
  }

  guardarAjusteStock(producto: ProductoInterface, ajuste: AjusteRequestInterface): void {
    if(!producto || !producto.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.ajustarStock(producto.id, ajuste).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== -1){
          this.productos[index] = data;
        }
        this.cerrarModalStock();
        this.successMessage = `Inventario de "${data.nombre}" ajustado con éxito`
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error('Error al ajustar stock:', error);
        // Capturar el mensaje de error que fue configurado en el back(ej. "No hay suficiente stock")
        this.errorMessage = `Error: ${error.error || 'No se pudo realizar el ajuste'}`;
      }
    })
  }

  cambiarEstado(productoEstado: EstadoProductoInterface): void {
    if(!productoEstado || !productoEstado.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.actualizarEstado(productoEstado).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== -1){
          this.productos[index] = data;
        }
        const accion = data.activo ? 'activado' : 'desactivado';
        //this.successMessage = `Producto "${data.nombre}" ${accion} con éxito.`;
        //this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = `Producto "${data.nombre}" ${accion} con éxito.`;
          this.cdr.detectChanges();
        }, 500);
        setTimeout(() => {
          this.successMessage = null
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (error) => {
        console.error('Error al cambiar el estado del producto:', error);
        setTimeout(() => {
          this.errorMessage = 'ERROR: No fue posible cambiar el estado del producto.';
          this.cdr.detectChanges();
        }, 500);
        setTimeout(() => {
          this.errorMessage = null
          this.cdr.detectChanges();
        }, 5000);
      }
    })
  }

}
