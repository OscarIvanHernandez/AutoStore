import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  tipoVentaSeleccionada: '' | VentaInterface['tipoVenta'] = '';
  private busquedaActual = '';

  constructor(
    private saleService: SaleService,
    private route: ActivatedRoute,
    cdr: ChangeDetectorRef
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = typeof params['q'] === 'string' ? params['q'].trim() : '';
      const tipoVenta = this.tipoVentaDesdeBusqueda(q);

      this.busquedaActual = tipoVenta ? '' : q;
      this.tipoVentaSeleccionada = tipoVenta ?? '';
      this.ventaSeleccionada = null;
      this.cargarVentas();
    });
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
    const filtros = {
      ...(this.busquedaActual ? { q: this.busquedaActual } : {}),
      ...(this.tipoVentaSeleccionada ? { tipoVenta: this.tipoVentaSeleccionada } : {}),
    };
    const solicitud = Object.keys(filtros).length > 0
      ? this.saleService.buscar(filtros)
      : this.saleService.obtenerVentas();

    this.cargarRecurso(
      'cargarVentas',
      solicitud,
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

  actualizarFiltroTipoVenta(event: Event): void {
    this.filtrarPorTipoVenta((event.target as HTMLSelectElement).value);
  }

  filtrarPorTipoVenta(tipoVenta: string): void {
    if (tipoVenta !== '' && tipoVenta !== 'CONTADO' && tipoVenta !== 'CREDITO') return;

    this.tipoVentaSeleccionada = tipoVenta;
    this.ventaSeleccionada = null;
    this.cargarVentas();
  }

  private tipoVentaDesdeBusqueda(q: string): VentaInterface['tipoVenta'] | null {
    const tipo = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (tipo === 'CONTADO') return 'CONTADO';
    if (tipo === 'CREDITO') return 'CREDITO';
    return null;
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
