import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteGanancias, TopProducto } from '../../../services/autostore.models';
import { ReportesService } from '../../../services/autostore.reportes-service';

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

  isLoading = false;
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

  private showSuccesMessage(message: string, duration: number): void {
    this.successMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
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
    this.reportesService.obtenerGanancias(this.fechaInicio, this.fechaFin).subscribe({
      next: (reporte) => {
        console.log('Reportes Ok')
        this.reporte = reporte;
        this.cargarTopProductos();
        setTimeout(() => {
          this.cdr.detectChanges();
          this.isLoading = false;
        }, 2500);
      },
      error: (error) => {
        console.error('Error al cargar el reporte:', error);
        this.showErrorMessage(
          `No fue posible cargar el reporte. Intenta nuevamente.`,
          3500
        );
        this.isLoading = false;
      }
    });
  }

  private cargarTopProductos(): void {
    this.reportesService.obtenerTopProductos(
      this.fechaInicio,
      this.fechaFin,
      this.limiteProductos
    ).subscribe({
      next: (productos) => {
        this.topProductos = productos;
        this.cdr.detectChanges();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los productos destacados:', err);
        this.topProductos = [];
        this.isLoading = false;
        this.showErrorMessage(
          `Se cargaron las métricas, pero no los productos destacados. (${err.error?.message})`,
          3500
        );
      }
    });
  }

  descargarCsv(): void {
    if (!this.fechaInicio || !this.fechaFin) return;

    this.reportesService.descargarCsvGanancias(
      this.fechaInicio,
      this.fechaFin,
      this.limiteProductos
    ).subscribe({
      next: (archivo) => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-ganancias-${this.fechaInicio}-${this.fechaFin}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el reporte:', error);
        this.errorMessage = 'No fue posible descargar el reporte CSV.';
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}
