import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SaleService } from '../../../services/autostore.sales-service';
import { VentaInterface } from '../../../services/autostore.models';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory extends BaseComponent implements OnInit {
  ventas: VentaInterface[] = [];
  ventaSeleccionada: VentaInterface | null = null;
  hasLoadedVentas = false;

  constructor(
    private saleService: SaleService,
    cdr: ChangeDetectorRef
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.cargarVentas();
  }

  esVentaDeHoy(fecha: string): boolean {
    if (!fecha) return false;
    const fechaVenta = new Date(fecha);
    if (Number.isNaN(fechaVenta.getTime())) return false;

    const hoy = new Date();
    return fechaVenta.getFullYear() === hoy.getFullYear()
      && fechaVenta.getMonth() === hoy.getMonth()
      && fechaVenta.getDate() === hoy.getDate();
  }

  cargarVentas(): void {
    this.cargarRecurso(
      'cargarVentas',
      this.saleService.obtenerVentas(),
      (data) => {
        this.ventas = data;
        if (this.ventaSeleccionada) {
          this.ventaSeleccionada = data.find((venta) => venta.id === this.ventaSeleccionada?.id) ?? null;
        }
        this.hasLoadedVentas = true;
      },
      'las ventas'
    );
  }

  verDetallesVenta(venta: VentaInterface): void {
    this.ventaSeleccionada = venta;
  }

  cancelarVenta(venta: VentaInterface): void {
    if (venta.estado === 'CANCELADA' || !this.esVentaDeHoy(venta.fechaVenta) || this.isSaving) return;
    if (!confirm(`¿Estás seguro de cancelar la venta #${venta.id}? El stock será devuelto.`)) return;

    this.ejecutarMutacion(
      this.saleService.cancelarVenta(venta.id),
      'cancelar venta',
      (ventaActualizada) => {
        this.ventas = this.ventas.map((item) => item.id === ventaActualizada.id ? ventaActualizada : item);
        this.ventaSeleccionada = ventaActualizada;
        this.showSuccessMessage('Venta cancelada correctamente. El stock fue devuelto.');
      }
    );
  }
}
