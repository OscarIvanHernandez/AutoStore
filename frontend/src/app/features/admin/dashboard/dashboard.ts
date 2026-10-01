import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardData } from '../../../services/autostore.models';
import { DashboardService } from '../../../services/autostore.dashboard-service';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

  dashboardDatos: DashboardData | null = null;

  isLoading: boolean = false;
  hasError: boolean = false;

  // Variables para mensajes
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  private showSuccesMessage(message: string, duration = 2500): void {
    this.successMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  private showErrorMessage(message: string, duration = 3500): void {
    this.errorMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  obtenerDatos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.dashboardService.obtenerDashboard().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar datos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los datos. (${error.status})`,
            3500
          );
        };
        return EMPTY;
      })
    ).subscribe((data) =>{
      console.log('Datos de dashboard ok', data)
      this.dashboardDatos = data;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }
}
