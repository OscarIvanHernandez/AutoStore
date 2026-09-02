import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CajaService } from '../../../services/autostore.caja-service';
import { CorteCaja } from '../../../services/autostore.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historico-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico-caja.html',
  styleUrl: './historico-caja.css',
})
export class HistoricoCaja implements OnInit {
  historico: CorteCaja[] = [];

  corteSeleccionado: CorteCaja | null = null;

  fechaInicio: string = '';
  fechaFin: string = '';

  isLoading: boolean = false;

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

  cargarHistorial(): void{
    this.cajaService.obtenerHistorialCaja().subscribe({
    next: (data) => {
        this.historico = data;
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
}
