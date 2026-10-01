import { DetalleVentaResponse } from './../../../services/autostore.models';
import { SaleService } from './../../../services/autostore.sales-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { VentaInterface } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';

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
  ventaSeleccionada: VentaInterface = this.ventaAuxForm();

  // Variable para la carga de los datos
  isLoading: boolean = true;
  hasError: boolean = false;

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

  private ventaAuxForm(): VentaInterface{
    return{
        id: 0,
        fechaVenta: '',
        subtotal: 0,
        descuento: 0,
        total: 0,
        tipoVenta: 'CONTADO',
        clienteId: null,
        estado: 'COMPLETADA',
        metodoPago: '',
        detalles: []
    };
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

  esVentaDeHoy(fecha: string): boolean {
    if (!fecha) return false;
    const fechaVenta = new Date(fecha).toISOString().split('T')[0];
    const hoy = new Date().toISOString().split('T')[0];
    return fechaVenta === hoy;
  }

  cargarVentas(): void {
    this.isLoading = true;
    this.saleService.obtenerVentas().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar las ventas: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar las ventas. (${error.status})`,
            3500
          );
        };
        return of([]);
      })
    ).subscribe((ventas) => {
      console.log('Productos cargados:', ventas);
      this.ventas = ventas;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    });
  }

  verDetallesVenta(venta: any): void {
    this.ventaSeleccionada = venta;
  }

  cancelarVenta(venta: any): void {
    if(!confirm(`¿Estaás seguro de cancelar la venta #${venta.id}? EL stock será devuelto.`)) {
      return;
    };
    this.isLoading = true;
    this.hasError = false;
    this.saleService.cancelarVenta(venta.id).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cancelar la venta: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cancelar la venta. (${error.status})`,
            3500
          );
        };
        return EMPTY;
      })
    ).subscribe(() => {
      this.cargarVentas();
      this.isLoading = false;
      this.showSuccesMessage(
        'Venta cancelada correctamente. Stock devuelto',
        2500
      );
    });
  };
}
