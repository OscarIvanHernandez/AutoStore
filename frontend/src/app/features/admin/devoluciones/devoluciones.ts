  import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DevolucionesService } from '../../../services/autostore.devoluciones-service';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionRequest, Devoluciones, ProductoDevolucionSeleccionado, VentaInterface } from '../../../services/autostore.models';
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

  hasLoadedVentas: boolean = false;
  hasLoadedDevoluciones: boolean = false;

  constructor(
    private saleService: SaleService,
    private devolucionesService: DevolucionesService,
    cdr: ChangeDetectorRef
  ) {super(cdr);};

  ngOnInit(): void {
    this.isLoading = true;
    this.cargarVentas();
    this.cargarDevoluciones();
    this.isLoading = false;
  };

  cargarVentas(): void {
    this.cargarRecurso('cargarVentas', this.saleService.obtenerVentas(), (data) => {
      const idSeleccionado = this.ventaSeleccionada?.id;
      const cantidadesSeleccionadas = new Map(
        this.productosADevolver.map((producto) => [producto.productoId, producto.cantidad])
      );
      this.ventas = data.filter((venta) => venta.estado !== 'CANCELADA');
      const ventaActualizada = this.ventas.find((venta) => venta.id === idSeleccionado);

      if (ventaActualizada) {
        this.ventaSeleccionada = ventaActualizada;
        this.productosADevolver = ventaActualizada.detalles.map((detalle) => ({
          productoId: detalle.producto.id,
          nombre: detalle.producto.nombre,
          marca: detalle.producto.marca ?? '',
          cantidad: Math.min(cantidadesSeleccionadas.get(detalle.producto.id) ?? 0, detalle.cantidad),
          maxCantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
        }));
      } else if (!idSeleccionado && this.ventas.length) {
        this.seleccionarVenta(this.ventas[0]);
      } else if (idSeleccionado) {
        this.ventaSeleccionada = null;
        this.productosADevolver = [];
        this.motivo = '';
      }

      this.hasLoadedVentas = true;
    });
  };

  puedeRegistrarDevolucion(): boolean {
    return this.hasLoadedVentas
      && this.ventaSeleccionada !== null
      && this.ventaSeleccionada.estado !== 'DEVOLUCION_TOTAL'
      && this.ventaSeleccionada.estado !== 'CANCELADA';
  };

  cargarDevoluciones(): void {
    this.cargarRecurso('cargarDevoluciones', this.devolucionesService.listar(), (data) => {
      this.devoluciones = data;
      this.hasLoadedDevoluciones = true;
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
    if (!this.hasLoadedVentas) {
      this.showErrorMessage('Espera a que las ventas terminen de cargar antes de registrar una devolución.');
      return;
    };

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

    this.ejecutarMutacion(this.devolucionesService.crear(payload), 'registrar devolución', () => {
      this.motivo = '';
      this.productosADevolver = [];
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
