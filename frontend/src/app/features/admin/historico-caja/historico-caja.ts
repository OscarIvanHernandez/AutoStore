import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CajaService } from '../../../services/autostore.caja-service';
import { CorteCaja } from '../../../services/autostore.models';
import { FormsModule } from '@angular/forms';
import { CorteDetalleTicket } from './modal/corte-detalle-ticket/corte-detalle-ticket';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-historico-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CorteDetalleTicket],
  templateUrl: './historico-caja.html',
  styleUrl: './historico-caja.css',
})
export class HistoricoCaja extends BaseComponent implements OnInit {
  historico: CorteCaja[] = [];

  corteSeleccionado: CorteCaja | null = null;

  hasLoadedHistorico = false;

  fechaInicio = '';
  fechaFin = '';
  historicoFiltrado: CorteCaja[] = [];
  filtroAplicado = false;
  filterValidationError: string | null = null;

  mostrarCorteDetalle = false;

  constructor(
    private cajaService: CajaService,
    cdr: ChangeDetectorRef
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  get cortesMostrados(): CorteCaja[] {
    return this.filtroAplicado ? this.historicoFiltrado : this.historico;
  }

  abrirCorteDetalle(corteDetalle: CorteCaja): void {
    this.corteSeleccionado = corteDetalle;
    this.mostrarCorteDetalle = true;
  }

  cerrarModalCorteDetalle(): void {
    this.mostrarCorteDetalle = false;
    this.corteSeleccionado = null;
  }

  cargarHistorial(): void {
    this.cargarRecurso(
      'cargarHistorial',
      this.cajaService.obtenerHistorialCaja(),
      (data) => {
        this.historico = data;
        if (this.filtroAplicado) {
          this.historicoFiltrado = this.filtrarCortesLocales(data);
        }
        this.hasLoadedHistorico = true;
      },
      'el historial de caja'
    );
  }

  filtrarPorFechas(): void {
    this.filterValidationError = null;
    if (!this.fechaInicio && !this.fechaFin) return;
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.filterValidationError = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
      return;
    }
    this.cargarRecurso(
      'filtrarHistorial',
      this.cajaService.buscarHistorialPorFechas(
        this.fechaInicio || undefined,
        this.fechaFin || undefined
      ),
      (data) => {
        this.historicoFiltrado = data;
        this.filtroAplicado = true;
      },
      'los cortes de caja'
    );
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.historicoFiltrado = [];
    this.filtroAplicado = false;
    this.filterValidationError = null;
    this.clearResourceError('filtrarHistorial');
  }

  private filtrarCortesLocales(cortes: CorteCaja[]): CorteCaja[] {
    const inicio = this.fechaInicio ? new Date(`${this.fechaInicio}T00:00:00`) : null;
    const fin = this.fechaFin ? new Date(`${this.fechaFin}T23:59:59.999`) : null;

    return cortes.filter((corte) => {
      const fechaApertura = new Date(corte.fechaApertura);
      return (!inicio || fechaApertura >= inicio) && (!fin || fechaApertura <= fin);
    });
  }
}
