  import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DevolucionesService } from '../../../services/autostore.devoluciones-service';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionRequest, Devoluciones, ProductoDevolucionSeleccionado, VentaInterface } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.css',
})
export class DevolucionesComponent extends BaseComponent implements OnInit {

  ventas: VentaInterface[] = [];
  devoluciones: Devoluciones[] = [];
  ventaSeleccionada: VentaInterface | null = null;
  productosADevolver: ProductoDevolucionSeleccionado[] = [];
  motivo = '';

  constructor(
    private saleService: SaleService,
    private devolucionesService: DevolucionesService,
    cdr: ChangeDetectorRef
  ) {super(cdr);};

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarDevoluciones();
  };

  cargarVentas(): void {
    this.isLoading = true;
    this.cargarRecurso('cargarVentas', this.saleService.obtenerVentas(), (data) => {
      this.ventas = data.filter((venta) => venta.estado !== 'CANCELADA');
      if (!this.ventaSeleccionada && this.ventas.length) {
        this.seleccionarVenta(this.ventas[0]);
      };
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    });
  };

  puedeRegistrarDevolucion(): boolean {
    return this.ventaSeleccionada !== null && this.ventaSeleccionada.estado !== 'DEVOLUCION_TOTAL' && this.ventaSeleccionada.estado !== 'CANCELADA';
  };

  cargarDevoluciones(): void {
    this.isLoading = true;
    this.cargarRecurso('cargarDevoluciones', this.devolucionesService.listar(), (data) => {
      this.devoluciones = data;
      setTimeout(() =>{
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    });
  };

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
  };

  registrarDevolucion(): void {
    if (!this.ventaSeleccionada) {
      this.showErrorMessage('Selecciona una venta antes de registrar la devolución.');
      return;
    };

    if (this.ventaSeleccionada.estado === 'DEVOLUCION_TOTAL' || this.ventaSeleccionada.estado === 'CANCELADA') {
      this.showErrorMessage('Esta venta ya fue devuelta por completo o fue cancelada.');
      return;
    };

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
    this.ejecutarMutacion(this.devolucionesService.crear(payload), 'registrar devolución', () => {
      this.motivo = '';
      this.productosADevolver = [];
      this.isLoading = false;
      this.cargarVentas();
      this.cargarDevoluciones();
      this.showSuccessMessage('Devolución registrada correctamente.');
    });
  };

  get productosSeleccionados(): ProductoDevolucionSeleccionado[] {
    return this.productosADevolver.filter((producto) => producto.cantidad > 0);
  };

  get totalReembolso(): number {
    return this.productosADevolver.reduce((total, producto) => {
      return total + producto.cantidad * producto.precioUnitario;
    }, 0);
  };
};

export { DevolucionesComponent as Devoluciones };
