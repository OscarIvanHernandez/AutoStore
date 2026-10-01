import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteGanancias, TopProducto } from '../../../services/autostore.models';
import { ReportesService } from '../../../services/autostore.reportes-service';
import { catchError, EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  fechaInicio = '';
  fechaFin = '';
  limiteProductos = 10;

  reporte: ReporteGanancias | null = null;
  topProductos: TopProducto[] = [];

  isLoading: boolean = false;
  hasError: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private reportesService: ReportesService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 6);

    this.fechaInicio = this.formatearFecha(inicio);
    this.fechaFin = this.formatearFecha(hoy);
    this.cargarReporte();
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

  cargarReporte(): void {
    this.errorMessage = null;

    if (!this.fechaInicio || !this.fechaFin) {
      this.errorMessage = 'Selecciona una fecha de inicio y una fecha final.';
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha final.';
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.reportesService.obtenerGanancias(this.fechaInicio, this.fechaFin).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar reportes: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los reportes. (${error.status})`,
            3500
          );
        };
        return EMPTY;
      })
    ).subscribe((data) => {
        console.log('Reportes Ok')
        this.reporte = data;
        this.cargarTopProductos();
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
    });
  }

  private cargarTopProductos(): void {
    this.reportesService.obtenerTopProductos(
      this.fechaInicio,
      this.fechaFin,
      this.limiteProductos
    ).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar TopProductos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar TopProductos. (${error.status})`,
            3500
          );
        };
        return of([])
      })
    ).subscribe((data) => {
        this.topProductos = data;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }

  descargarCsv(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.isLoading = true;
    this.hasError = false;
    this.reportesService.descargarCsvGanancias(
      this.fechaInicio,
      this.fechaFin,
      this.limiteProductos
    ).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al descargar Csv: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al descargar el reporte. (${error.status})`,
            3500
          );
        };
        return EMPTY
      })
    ).subscribe((data) => {
      const url = URL.createObjectURL(data);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `reporte-ganancias-${this.fechaInicio}-${this.fechaFin}.csv`;
      enlace.click();
      URL.revokeObjectURL(url);
      this.isLoading = false;
      this.showSuccesMessage(`Reporte descargado correctamente!`);
    });
  }

  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}
