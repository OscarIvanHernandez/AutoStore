import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardData } from '../../../services/autostore.models';
import { DashboardService } from '../../../services/autostore.dashboard-service';

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

  obtenerDatos(): void {
    this.isLoading = true;
    this.dashboardService.obtenerDashboard().subscribe({
      next: (data) =>{
        console.log('Datos de dashboard ok', data)
        this.dashboardDatos = data;
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => {
        console.log('Error al obtener datos: ', err)
        this.showErrorMessage(
          `Hubo un error al obtener los datos: (${err.error?.message})`,
          3500
        );
      }
    })
  }
}
