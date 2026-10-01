  import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DevolucionesService } from '../../../services/autostore.devoluciones-service';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionRequest, Devoluciones, VentaInterface } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';

interface ProductoDevolucionSeleccionado {
  productoId: number;
  nombre: string;
  marca: string;
  cantidad: number;
  maxCantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.css',
})
export class DevolucionesComponent implements OnInit {
  ventas: VentaInterface[] = [];
  devoluciones: Devoluciones[] = [];
  ventaSeleccionada: VentaInterface | null = null;
  productosADevolver: ProductoDevolucionSeleccionado[] = [];
  motivo = '';
  isLoading = false;
  hasError: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private saleService: SaleService,
    private devolucionesService: DevolucionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarDevoluciones();
  }

  private showSuccessMessage(message: string, duration = 2500): void {
    this.successMessage = message;
    this.errorMessage = null;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  private showErrorMessage(message: string, duration = 3000): void {
    this.errorMessage = message;
    this.successMessage = null;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  cargarVentas(): void {
    this.isLoading = true;
    this.saleService.obtenerVentas().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar ventas: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar las ventas. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((ventas) => {
      this.ventas = ventas.filter((venta) => venta.estado !== 'CANCELADA');
      if (!this.ventaSeleccionada && this.ventas.length) {
        this.seleccionarVenta(this.ventas[0]);
      }
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 500);
    });
  }

  puedeRegistrarDevolucion(): boolean {
    return this.ventaSeleccionada !== null && this.ventaSeleccionada.estado !== 'DEVOLUCION_TOTAL' && this.ventaSeleccionada.estado !== 'CANCELADA';
  }

  cargarDevoluciones(): void {
    this.isLoading = true;
    this.hasError = false;
    this.devolucionesService.listar().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar devoluciones: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar las devoluciones. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((data) => {
      this.devoluciones = data;
      setTimeout(() =>{
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 500);
    });
  }

  seleccionarVenta(venta: VentaInterface): void {
    this.ventaSeleccionada = venta;
    this.motivo = '';
    this.productosADevolver = venta.detalles.map((detalle) => ({
      productoId: detalle.producto.id,
      nombre: detalle.producto.nombre,
      marca: detalle.producto.marca ?? '',
      cantidad: 0,
      maxCantidad: detalle.cantidad, // cantidad vendida en esta venta, no el stock actual del inventario
      precioUnitario: detalle.precioUnitario,
    }));
  }

  registrarDevolucion(): void {
    if (!this.ventaSeleccionada) {
      this.showErrorMessage('Selecciona una venta antes de registrar la devolución.');
      return;
    }

    if (this.ventaSeleccionada.estado === 'DEVOLUCION_TOTAL' || this.ventaSeleccionada.estado === 'CANCELADA') {
      this.showErrorMessage('Esta venta ya fue devuelta por completo o fue cancelada.');
      return;
    }

    const productos = this.productosADevolver
      .filter((producto) => producto.cantidad > 0)
      .map((producto) => ({
        productoId: producto.productoId,
        cantidad: producto.cantidad,
      }));

    if (!this.motivo.trim()) {
      this.showErrorMessage('Escribe el motivo de la devolución.');
      return;
    };

    if (!productos.length) {
      this.showErrorMessage('Debe indicar al menos un producto con cantidad válida.');
      return;
    };

    const payload: DevolucionRequest = {
      ventaId: this.ventaSeleccionada.id,
      motivo: this.motivo.trim(),
      productos,
    };

    this.isLoading = true;
    this.hasError = false;

    this.devolucionesService.crear(payload).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al registrar la devolucion: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al registrar la devolución. (${error.status})`,
            4500
          );
        };
        return EMPTY;
      })
    ).subscribe(() => {
      this.motivo = '';
      this.productosADevolver = [];
      this.isLoading = false;
      this.cargarVentas();
      this.cargarDevoluciones();
      this.showSuccessMessage('Devolución registrada correctamente.');
    });
  }

  get productosSeleccionados(): ProductoDevolucionSeleccionado[] {
    return this.productosADevolver.filter((producto) => producto.cantidad > 0);
  }

  get totalReembolso(): number {
    return this.productosADevolver.reduce((total, producto) => {
      return total + producto.cantidad * producto.precioUnitario;
    }, 0);
  }
}

export { DevolucionesComponent as Devoluciones };
