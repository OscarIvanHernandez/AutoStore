import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Compra, Distribuidor } from '../../../services/autostore.models';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Detalles } from './modal/detalles/detalles';
import { catchError, EMPTY, of } from 'rxjs';

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
  hasError: boolean = false;

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
    this.hasError = false;
    this.compraService.listarCompras().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al obtener las compras: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al obtener las compras. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((data) => {
      this.historial = data;
      console.log('Compras cargadas: ', data.length);
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 1000);
    });
  }

  buscarCompraPorId(): void {
    if (!this.compraId || this.compraId < 1) {
      this.showErrorMessage('Ingresa un ID de compra válido.', 3500);
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.compraService.buscarPorId(this.compraId).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al obtener la compra: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al buscar la compra. (${error.status})`,
            3500
          );
        };
        return EMPTY;
      })
    ).subscribe((data) => {
        this.historial = [data];
        setTimeout(() =>{
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 500);
    });
  }

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.hasError = false;
    this.distribuidorService.listar().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al obtener los distribuidores: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al obtener los distribuidores. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((data) => {
      this.distribuidores = data;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
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
    this.hasError = false;
    this.compraService.filtrarCompras(
      this.fechaInicio || undefined,
      this.fechaFin || undefined,
      this.distribuidorId || undefined).pipe(
        catchError((error) => {
          this.hasError = true;
          this.isLoading = false;
          console.log('Error al aplicar filtros: ', error);
          if (error.status === 0){
            this.showErrorMessage(
              `No se pudo conectar con el servidor.`,
              3500
            );
          } else {
            this.showErrorMessage(
              `Ocurrió un error al aplicar filtros. (${error.status})`,
              3500
            );
          };
          return EMPTY;
        })
      ).subscribe((data) => {
        this.historial = data;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 500);
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
