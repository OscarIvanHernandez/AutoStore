import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Compra, Distribuidor } from '../../../services/autostore.models';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Detalles } from './modal/detalles/detalles';

@Component({
  selector: 'app-historico-mercancia',
  standalone: true,
  imports: [CommonModule, FormsModule, Detalles],
  templateUrl: './historico-mercancia.html',
  styleUrl: './historico-mercancia.css',
})
export class HistoricoMercancia implements OnInit{
  //Compras y sus detalles
  historial: Compra[] = [];
  compraId: number | null = null;
  fechaInicio = '';
  fechaFin = '';
  distribuidorId: number | null = null;
  distribuidores: Distribuidor[] = [];
  compraSeleccionada: Compra | null = null;
  mostrarDetalles = false;

  isLoading: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  constructor(
    private compraService: CompraDistribuidorService,
    private distribuidorService: DistribuidorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarDistribuidores();
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

  cargarCompras(): void {
    this.isLoading = true;
    this.compraService.listarCompras().subscribe({
      next: (data) => {
        this.historial = data;
        console.log('Compras cargadas: ', data.length);
        this.isLoading = false;
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 1500);
      },
      error: (err) => {
        console.log('Error al cargar las compras: ', err);
        this.isLoading = false;
        this.showErrorMessage(
          `Hubo un error al cargar las compras: (${err.error?.message})`,
        3500);
      },
    });
  }

  buscarCompraPorId(): void {
    if (!this.compraId || this.compraId < 1) {
      this.showErrorMessage('Ingresa un ID de compra válido.', 3500);
      return;
    }

    this.isLoading = true;
    this.compraService.buscarPorId(this.compraId).subscribe({
      next: (compra) => {
        this.historial = [compra];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al buscar la compra:', err);
        this.historial = [];
        this.isLoading = false;
        this.showErrorMessage(
          `No se encontró la compra (${err.status || 'error'}).`,
          3500
        );
      },
    });
  }

  cargarDistribuidores(): void {
    this.distribuidorService.listar().subscribe({
      next: (data) => {
        this.distribuidores = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar distribuidores:', err),
    });
  }

  aplicarFiltros(): void {
    if (!this.fechaInicio && !this.fechaFin && !this.distribuidorId) {
      this.cargarCompras();
      return;
    }

    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.showErrorMessage('La fecha inicial no puede ser posterior a la fecha final.', 3500);
      return;
    }

    this.isLoading = true;
    this.compraService.filtrarCompras(
      this.fechaInicio || undefined,
      this.fechaFin || undefined,
      this.distribuidorId || undefined
    ).subscribe({
      next: (data) => {
        this.historial = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al filtrar compras:', err);
        this.isLoading = false;
        this.showErrorMessage('No fue posible filtrar el historial de compras.', 3500);
      },
    });
  }

  limpiarBusqueda(): void {
    this.compraId = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.distribuidorId = null;
    this.cargarCompras();
  }

  abrirDetalles(compra: Compra): void {
    this.compraSeleccionada = compra;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.compraSeleccionada = null;
  }
}
