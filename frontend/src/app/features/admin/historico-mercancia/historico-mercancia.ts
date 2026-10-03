import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Compra, Distribuidor } from '../../../services/autostore.models';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Detalles } from './modal/detalles/detalles';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-historico-mercancia',
  standalone: true,
  imports: [CommonModule, FormsModule, Detalles],
  templateUrl: './historico-mercancia.html',
  styleUrl: './historico-mercancia.css',
})
export class HistoricoMercancia extends BaseComponent implements OnInit{
  //Compras y sus detalles
  historial: Compra[] = [];
  compraId: number | null = null;
  fechaInicio = '';
  fechaFin = '';
  distribuidorId: number | null = null;
  distribuidores: Distribuidor[] = [];
  compraSeleccionada: Compra | null = null;
  mostrarDetalles = false;

  constructor(
    private compraService: CompraDistribuidorService,
    private distribuidorService: DistribuidorService,
    cdr: ChangeDetectorRef
  ) {super(cdr);};

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarDistribuidores();
  };

  cargarCompras(): void {
    this.isLoading = true;
    this.cargarRecurso('cargarCompras', this.compraService.listarCompras(), (data) => {
      this.historial = data;
      console.log('Compras cargadas: ', data.length);
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
    });
  };

  buscarCompraPorId(): void {
    if (!this.compraId || this.compraId < 1) {
      this.showErrorMessage('Ingresa un ID de compra válido.', 3500);
      return;
    }

    this.isLoading = true;
    this.cargarRecurso('buscarCompraId', this.compraService.buscarPorId(this.compraId), (data) => {
        this.historial = [data];
        this.isLoading = false;
        setTimeout(() =>{

          this.cdr.detectChanges();
        }, 500);
    });
  };

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.cargarRecurso('distribuidores', this.distribuidorService.listar(), (data) => {
      this.distribuidores = data;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
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
    this.cargarRecurso('filtrarCompras', this.compraService.filtrarCompras(
      this.fechaInicio || undefined,
      this.fechaFin || undefined,
      this.distribuidorId || undefined), (data) => {
        this.historial = data;
        this.isLoading = false;
        setTimeout(() => {
          this.cdr.detectChanges();
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
