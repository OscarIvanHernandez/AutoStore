import { AjusteRequestInterface, ProductoInterface } from './../../../services/autostore.models';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ProductoService} from '../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit{
  // Varaibles Producto
  productos: ProductoInterface[] = [];
  nuevoProducto: ProductoInterface = this.resetearFormulario();
  productoSeleccionado: ProductoInterface | null = null;
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

    this.mostrarModalAlternar = true;
  }

  cerrarModalAlternar() {
    this.mostrarModalAlternar = false;
  }

  abrirModalAjustarStock(producto: ProductoInterface) {
    this.productoSeleccionado = producto;
    this.ajuste = this.resetearAjuste();
    this.mostrarModalStock = true;
  }

  cerrarModalStock() {
    this.mostrarModalStock = false;
  }

  guardarProducto() {
    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.crear(this.nuevoProducto).subscribe({
      next: (data) => {
        // Se añade el nuevo producto
        this.productos.push(data);
        this.cerrarModal();
        this.nuevoProducto = this.resetearFormulario();
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

  editarProducto() {
    if(!this.productoEditar || !this.productoEditar.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.actualizar(this.productoEditar.id, this.productoEditar).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== 1){
          this.productos[index] = data;
        }
        this.successMessage = 'Producto editado correctamente.';
        this.cerrarModalEditar();
        setTimeout(() => {
          this.successMessage = null;
        }, 1500)
      },
      error: (error) => {
        this.cerrarModal();
        console.error('Error al editar el producto: ', error);
        this.errorMessage =`Error al editar el producto: (${error.status}`;
      }
    });
  }

  guardarAjusteStock(): void {
    if(!this.productoSeleccionado || !this.productoSeleccionado.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.ajustarStock(this.productoSeleccionado.id, this.ajuste).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== 1){
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

    cambiarEstado(): void {
    if(!this.productoSeleccionado || !this.productoSeleccionado.id) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productoService.actualizarEstado(this.productoSeleccionado).subscribe({
      next: (data) => {
        const index = this.productos.findIndex(p => p.id === data.id);
        if(index !== 1){
          this.productos[index] = data;
        }
        // Mensaje dinámico según el nuevo estado
        const accion = data.activo ? 'activado' : 'desactivado';
        this.successMessage = `Producto "${data.nombre}" ${accion} con éxito.`;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error('Error al cambiar el estado del producto:', error);
        this.errorMessage = 'No se pudo cambiar el estado del producto.';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    })
  }

}
