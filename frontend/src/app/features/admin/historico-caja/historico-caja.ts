import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CajaService } from '../../../services/autostore.caja-service';
import { CorteCaja } from '../../../services/autostore.models';
import { FormsModule } from '@angular/forms';
import { CorteDetalleTicket } from './modal/corte-detalle-ticket/corte-detalle-ticket';

@Component({
  selector: 'app-historico-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, CorteDetalleTicket],
  templateUrl: './historico-caja.html',
  styleUrl: './historico-caja.css',
})
export class HistoricoCaja implements OnInit {
  historico: CorteCaja[] = [];

  corteSeleccionado: CorteCaja | null = null;

  fechaInicio: string = '';
  fechaFin: string = '';
  historicoFiltrado: CorteCaja[] = [];
  filtroAplicado: boolean = false;

  isLoading: boolean = false;

  mostrarCorteDetalle: boolean = false;
  cerrarCorteDetalle: boolean = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

    constructor(
    private cajaService: CajaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
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

  abrirCorteDetalle(corteDetalle: CorteCaja): void {
    this.corteSeleccionado = corteDetalle;
    this.mostrarCorteDetalle = true;
  }

  cerrarModalCorteDetalle(): void {
    this.mostrarCorteDetalle = false;
  }

  cargarHistorial(): void{
    this.cajaService.obtenerHistorialCaja().subscribe({
    next: (data) => {
        this.historico = data;
        this.historicoFiltrado = [];
        this.filtroAplicado = false;
        this.isLoading = false
        setTimeout(()=>{},2000);
      this.cdr.markForCheck();
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Error al cargar el historico:', error);
      this.showErrorMessage(
        `Hubo un error al cargar el historico. (${error.status})`,
        12000
      );
    }
  });
  }

  filtrarPorFechas(): void {
    if (!this.fechaInicio && !this.fechaFin) return;
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.showErrorMessage('La fecha de inicio no puede ser posterior a la fecha de fin.', 5000);
      return;
    }
    this.isLoading = true;
    this.cajaService.buscarHistorialPorFechas(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.historicoFiltrado = data;
        this.filtroAplicado = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al filtrar cortes:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.historicoFiltrado = [];
    this.filtroAplicado = false;
    this.cargarHistorial();
  }

  verTicket(corte: CorteCaja): void {
    this.corteSeleccionado = corte;
  }

  cerrarModal(): void {
    this.corteSeleccionado = null;
  }
}
