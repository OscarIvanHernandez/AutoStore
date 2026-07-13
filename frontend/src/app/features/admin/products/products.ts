import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ProductoService} from '../../../services/autostore.product-service';
import { ProductoInterface } from '../../../services/autostore.models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit{
  productos: ProductoInterface[] = [];
  nuevoProducto: ProductoInterface = this.resetearFormulario();
  isLoading: boolean = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  mostrarModal: boolean = false;


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


  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
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

}
