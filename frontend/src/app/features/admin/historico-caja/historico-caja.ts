import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CajaService } from '../../../services/autostore.caja-service';
import { CorteCaja } from '../../../services/autostore.models';
import { FormsModule } from '@angular/forms';
import { CorteDetalleTicket } from './modal/corte-detalle-ticket/corte-detalle-ticket';
import { catchError, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-historico-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, CorteDetalleTicket],
  templateUrl: './historico-caja.html',
  styleUrl: './historico-caja.css',
})
export class HistoricoCaja extends BaseComponent implements OnInit {
  historico: CorteCaja[] = [];

  corteSeleccionado: CorteCaja | null = null;

  hasLoadedHistorico: boolean = false;

  fechaInicio: string = '';
  fechaFin: string = '';
  historicoFiltrado: CorteCaja[] = [];
  filtroAplicado: boolean = false;

  mostrarCorteDetalle: boolean = false;
  cerrarCorteDetalle: boolean = false;

    constructor(
    private cajaService: CajaService,
    cdr: ChangeDetectorRef
  ) {super(cdr);};

  ngOnInit(): void {
    this.cargarHistorial();
  };

  abrirCorteDetalle(corteDetalle: CorteCaja): void {
    this.corteSeleccionado = corteDetalle;
    this.mostrarCorteDetalle = true;
  };

  cerrarModalCorteDetalle(): void {
    this.mostrarCorteDetalle = false;
  };

  cargarHistorial(): void{
    this.isLoading = true;
    this.hasLoadedHistorico = false;
    this.cargarRecurso('cargarHistorial', this.cajaService.obtenerHistorialCaja(), (data) => {
      this.historico = data;
      this.historicoFiltrado = [];
      this.filtroAplicado = false;
      this.isLoading = false;
      this.hasLoadedHistorico = true;
      setTimeout(()=>{
        this.cdr.detectChanges();
      }, 500);
    });
  };

  filtrarPorFechas(): void {
    if (!this.fechaInicio && !this.fechaFin) return;
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.showErrorMessage('La fecha de inicio no puede ser posterior a la fecha de fin.', 4000);
      return;
    }
    this.isLoading = true;
    this.cargarRecurso('filtrarPorFechas', this.cajaService.buscarHistorialPorFechas(
      this.fechaInicio,
      this.fechaFin), (data) => {
        this.historicoFiltrado = data;
        this.filtroAplicado = true;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
    });
  };

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.historicoFiltrado = [];
    this.filtroAplicado = false;
    this.cargarHistorial();
  };

  verTicket(corte: CorteCaja): void {
    this.corteSeleccionado = corte;
  };

  cerrarModal(): void {
    this.corteSeleccionado = null;
  };
};
