import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DevolucionesService } from '../../../services/autostore.devoluciones-service';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionRequest, Devoluciones, VentaInterface } from '../../../services/autostore.models';

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
    this.saleService.obtenerVentas().subscribe({
      next: (ventas) => {
        this.ventas = ventas.filter((venta) => venta.estado !== 'CANCELADA');
        if (!this.ventaSeleccionada && this.ventas.length) {
          this.seleccionarVenta(this.ventas[0]);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar ventas', error);
        this.showErrorMessage('No se pudieron cargar las ventas.');
      }
    });
  }

  cargarDevoluciones(): void {
    this.devolucionesService.listar().subscribe({
      next: (data) => {
        this.devoluciones = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar devoluciones', error);
      }
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
      maxCantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
    }));
  }

  registrarDevolucion(): void {
    if (!this.ventaSeleccionada) {
      this.showErrorMessage('Selecciona una venta antes de registrar la devolución.');
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
    }

    if (!productos.length) {
      this.showErrorMessage('Debe indicar al menos un producto con cantidad válida.');
      return;
    }

    const payload: DevolucionRequest = {
      ventaId: this.ventaSeleccionada.id,
      motivo: this.motivo.trim(),
      productos,
    };

    this.devolucionesService.crear(payload).subscribe({
      next: () => {
        this.showSuccessMessage('Devolución registrada correctamente.');
        this.motivo = '';
        this.productosADevolver = [];
        this.cargarVentas();
        this.cargarDevoluciones();
      },
      error: (error) => {
        console.error('Error al registrar devolución', error);
        const message = error?.error?.message || 'No se pudo registrar la devolución.';
        this.showErrorMessage(message);
      },
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
