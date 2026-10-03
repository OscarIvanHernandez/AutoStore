import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardData } from '../../../services/autostore.models';
import { DashboardService } from '../../../services/autostore.dashboard-service';
import { catchError, EMPTY } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard extends BaseComponent implements OnInit{

  dashboardDatos: DashboardData | null = null;
  hasLoadedDashboard: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    cdr: ChangeDetectorRef
  ){super(cdr);};

  ngOnInit(): void {
    this.obtenerDatos();
  };

  obtenerDatos(): void {
    this.isLoading = true;
    this.hasLoadedDashboard = false;
    this.cargarRecurso('cargarDashboard', this.dashboardService.obtenerDashboard(), (data) => {
      console.log('Datos de dashboard ok', data)
      this.dashboardDatos = data;
      this.hasLoadedDashboard = true;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 1000);
    });
  };
};
