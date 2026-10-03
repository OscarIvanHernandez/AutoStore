import { DetalleVentaResponse } from './../../../services/autostore.models';
import { SaleService } from './../../../services/autostore.sales-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { VentaInterface } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory extends BaseComponent implements OnInit{
  //Obtener las ventas
  ventas: VentaInterface[] = [];
  ventaSeleccionada: VentaInterface = this.ventaAuxForm();

  constructor(
    private saleService: SaleService,
    cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ){super (cdr);}

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

  esVentaDeHoy(fecha: string): boolean {
    if (!fecha) return false;
    const fechaVenta = new Date(fecha).toISOString().split('T')[0];
    const hoy = new Date().toISOString().split('T')[0];
    return fechaVenta === hoy;
  }

  cargarVentas(): void {
    this.isLoading = true;
    this.cargarRecurso('cargarVenta', this.saleService.obtenerVentas(), (data) => {
      console.log('Productos cargados:', data);
      this.ventas = data;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  verDetallesVenta(venta: any): void {
    this.ventaSeleccionada = venta;
  }

  cancelarVenta(venta: any): void {
    if(!confirm(`¿Estás seguro de cancelar la venta #${venta.id}? EL stock será devuelto.`)) {
      return;
    };
    this.isLoading = true;
    this.ejecutarMutacion(this.saleService.cancelarVenta(venta.id), 'cancelar venta', () => {
      this.cargarVentas();
      this.isLoading = false;
      this.showSuccessMessage(
        'Venta cancelada correctamente. Stock devuelto'
      );
    });
  };
}
