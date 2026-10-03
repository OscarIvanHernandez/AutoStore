import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteGanancias, TopProducto } from '../../../services/autostore.models';
import { ReportesService } from '../../../services/autostore.reportes-service';
import { catchError, EMPTY, finalize, forkJoin, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes extends BaseComponent implements OnInit {
  fechaInicio = '';
  fechaFin = '';
  limiteProductos = 10;

  reporte: ReporteGanancias | null = null;
  topProductos: TopProducto[] = [];


  isDownloadingCsv: boolean = false;
  initialLoadError: string | null = null;


  constructor(
    private reportesService: ReportesService,
    cdr: ChangeDetectorRef) {
      super(cdr);
    };

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 6);

    this.fechaInicio = this.formatearFecha(inicio);
    this.fechaFin = this.formatearFecha(hoy);
    this.cargarReporte();
  };


  cargarReporte(): void {
    this.errorMessage = null;
    this.initialLoadError = null;

    if (!this.validarFechas()) return;

    this.isLoading = true;
    forkJoin({
      reporte: this.reportesService.obtenerGanancias(this.fechaInicio, this.fechaFin),

      topProductos: this.reportesService.obtenerTopProductos(
        this.fechaInicio,
        this.fechaFin,
        this.limiteProductos
      ).pipe(catchError((error) => {
        this.topProductos = [];
        this.showErrorMessage(this.mensajeError(error, 'cargar los productos más vendidos'));
        return of([]);
      }))
    }).pipe(
      catchError((error) => {
        const message = this.mensajeError(error, 'cargar el reporte');
        if (this.reporte) {
          this.showErrorMessage(message);
        } else {
          this.initialLoadError = message;
        }
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(({ reporte, topProductos }) => {
      this.reporte = reporte;
      this.topProductos = topProductos;
    });
  }

  descargarCsv(): void {
    this.errorMessage = null;
    if (!this.validarFechas()) return;

    this.isDownloadingCsv = true;
    this.cargarRecurso('descargarCsv', this.reportesService.descargarCsvGanancias(
      this.fechaInicio,
      this.fechaFin,
      this.limiteProductos), (data) => {
        const url = URL.createObjectURL(data);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-ganancias-${this.fechaInicio}-${this.fechaFin}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
        this.showSuccessMessage('Reporte descargado correctamente.');
    });
  }

  private validarFechas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) {
      this.errorMessage = 'Selecciona una fecha de inicio y una fecha final.';
      return false;
    }

    if (this.fechaInicio > this.fechaFin) {
      this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha final.';
      return false;
    }

    return true;
  }

  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}
