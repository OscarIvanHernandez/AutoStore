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

  private showSuccesMessage(message: string, duration: number): void {
    this.successMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    setTimeout(() => {
      this.errorMessage = message;
      this.cdr.detectChanges();
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

  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
        this.productos = productos;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar productos:', error);
        this.showErrorMessage(
          `Hubo un error al cargar los horarios. (${error.status})`,
          12000
        );
      }
    });
  }

    guardarProducto(producto: ProductoInterface) {
    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.crear(producto).subscribe({
      next: (data) => {
        // Se añade el nuevo producto
        this.productos.push(data);
        this.cerrarModal();
        this.showSuccesMessage(
          'Nuevo producto agregado correctamente.',
          8000
        );
      },
      error: (error) => {
        this.cerrarModal();
        console.error('Error al crear el producto: ', error);
        this.showErrorMessage(
          `Error al crear el producto: (${error.status}`,
          8000);
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
        this.cerrarModalEditar();
        this.showSuccesMessage(
          'El producto fue editado correctamente.',
          8000
        );
      },
      error: (error) => {
        this.cerrarModalEditar();
        console.error('Error al editar el producto: ', error);
        this.showErrorMessage(
          `Error al editar el producto: (${error.status})`,
          8000
        );
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
      },
      error: (error) => {
        console.error('Error al ajustar stock:', error);
        // Capturar el mensaje de error que fue configurado en el back(ej. "No hay suficiente stock")
        this.showErrorMessage(`
          Error: ${error.error || 'No se pudo realizar el ajuste'}`,
          8000
        );
      }
    });
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
        this.showSuccesMessage(
          `Producto "${data.nombre}" ${accion} con éxito.`,
          5000
        );
      },
      error: (error) => {
        console.error('Error al cambiar el estado del producto:', error);
        this.showErrorMessage(
          'ERROR: No fue posible cambiar el estado del producto.',
          5000
        );
      }
    });
  }

}
