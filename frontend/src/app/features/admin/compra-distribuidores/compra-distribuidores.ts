import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompraRequest, Distribuidor, ItemCarrito, ProductoInterface } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { ProductoService } from '../../../services/autostore.product-service';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { catchError, EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-compra-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra-distribuidores.html',
  styleUrl: './compra-distribuidores.css',
})
export class CompraDistribuidores implements OnInit{

  distribuidores: Distribuidor[] = [];
  productos: ProductoInterface[] = [];

  // Formulario principal
  distribuidorSeleccionadoId: number | null = null;
  folio: string = '';

  // Formulario para agregar producto al carrito de entrada
  productoSeleccionado: ProductoInterface | null = null;
  cantidad: number = 1;
  precioUnitarioCompra: number = 0;

  // Carrito de compras
  items: ItemCarrito[] = [];
  totalCompra: number = 0;

  isLoading: boolean = false;
  hasError: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  constructor(
    private distribuidorService: DistribuidorService,
    private productoService: ProductoService,
    private compraService: CompraDistribuidorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDistribuidores();
    this.cargarProductos();
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

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.hasError = false;
    this.distribuidorService.listar().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los distribuidores: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los distribuidores. (${error.status})`,
            3500
          );
        }
        return of([]);
      })
    ).subscribe((data) => {
      this.distribuidores = data;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },500);
    });
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.productoService.getProductos().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los distribuidores: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los distribuidores. (${error.status})`,
            3500
          );
        }
        return of([]);
      })
    ).subscribe((data) => {
      this.productos = data;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },500);
    });
  }

  onSeleccionarProducto(): void {
    if (this.productoSeleccionado) {
      // Sugiere el precio de compra actual registrado en el producto
      this.precioUnitarioCompra = this.productoSeleccionado.precioCompra || 0;
    }
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || this.cantidad <= 0 || this.precioUnitarioCompra <= 0) return;

    const subtotal = this.cantidad * this.precioUnitarioCompra;

    this.items.push({
      productoId: this.productoSeleccionado.id!,
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitarioCompra,
      subTotal: subtotal,
      precioTipo: 'MOSTRADOR',
      stockMaximo: this.productoSeleccionado.stockActual
    });

    this.calcularTotal();
    this.limpiarSeleccionProducto();
  }

  quitarItem(index: number): void {
    this.items.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCompra = this.items.reduce((acc, item) => acc + item.subTotal, 0);
  }

  guardarCompra(): void {
    this.isLoading = true;
    this.hasError = false;
    if (!this.distribuidorSeleccionadoId || this.items.length === 0) {
      alert('Seleccione un distribuidor y al menos un producto.');
      return;
    }

    const payload: CompraRequest = {
      distribuidorId: this.distribuidorSeleccionadoId,
      folio: this.folio,
      productos: this.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioCompra: item.precioUnitario
      }))
    };

    this.compraService.registrarCompra(payload).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los distribuidores: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los distribuidores. (${error.status})`,
            3500
          );
        }
        return EMPTY;
      })
    ).subscribe(() => {
      console.log('Compra de mercancancia registrada OK');
      this.items = [];
      this.folio = '';
      this.totalCompra = 0;
      this.showSuccesMessage(
        `📦 Entrada de mercancía registrada. Stock e historial actualizados.`,
        4500
      );
    });
  }

  private limpiarSeleccionProducto(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioUnitarioCompra = 0;
  }
}
