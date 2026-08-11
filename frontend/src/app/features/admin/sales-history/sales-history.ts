import { SaleService } from './../../../services/autostore.sales-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { VentaInterface } from '../../../services/autostore.models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory implements OnInit{
  //Obtener las ventas
  ventas: VentaInterface[] = [];
  ventaSeleccionada: VentaInterface | null = null;

  // Variable para la carga de los datos
  isLoading: boolean = true;

  // Variables para mensajes
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private saleService: SaleService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.cargarVentas();
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

  cargarVentas(): void {
    this.isLoading = true;
    this.saleService.obtenerVentas().subscribe({
      next: (ventas) => {
        console.log('Productos cargados:', ventas);
        this.ventas = ventas;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar ventas:', error);
        this.showErrorMessage(
          `Hubo un error al cargar los horarios. (${error.status})`,
          12000
        );
      }
    });
  }
}
