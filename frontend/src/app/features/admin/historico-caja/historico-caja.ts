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
  }

    private showSuccesMessage(message: string, duration = 2500): void {
    this.successMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration = 3500): void {
    this.errorMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
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
    this.isLoading = true;
    this.hasError = false;
    this.cajaService.obtenerHistorialCaja().pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar el historial: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar el historial. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((data) =>{
      this.historico = data;
      this.historicoFiltrado = [];
      this.filtroAplicado = false;
      setTimeout(()=>{
        this.isLoading = false
        this.cdr.detectChanges();
      }, 500);
    });
  }

  filtrarPorFechas(): void {
    if (!this.fechaInicio && !this.fechaFin) return;
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.showErrorMessage('La fecha de inicio no puede ser posterior a la fecha de fin.', 4000);
      return;
    }
    this.isLoading = true;
    this.hasError = false;
    this.cajaService.buscarHistorialPorFechas(this.fechaInicio, this.fechaFin).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar el historial: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar el historial. (${error.status})`,
            3500
          );
        }
        return of([])
      })
    ).subscribe((data) => {
        this.historicoFiltrado = data;
        this.filtroAplicado = true;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
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
