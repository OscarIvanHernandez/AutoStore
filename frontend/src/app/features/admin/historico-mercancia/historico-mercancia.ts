import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Compra, Distribuidor } from '../../../services/autostore.models';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Detalles } from './modal/detalles/detalles';
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

  hasLoadedCompras: boolean = false;
  hasLoadedDistribuidores: boolean = false;

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
    this.cargarRecurso('cargarCompras', this.compraService.listarCompras(), (data) => {
      this.historial = data;
      this.hasLoadedCompras = true;
    });
  };

  buscarCompraPorId(): void {
    if (!this.compraId || this.compraId < 1) {
      this.showErrorMessage('Ingresa un ID de compra válido.', 3500);
      return;
    }

    this.cargarRecurso('buscarCompraId', this.compraService.buscarPorId(this.compraId), (data) => {
      this.historial = [data];
      this.hasLoadedCompras = true;
    });
  };

  cargarDistribuidores(): void {
    this.cargarRecurso('distribuidores', this.distribuidorService.listar(), (data) => {
      this.distribuidores = data;
      this.hasLoadedDistribuidores = true;
    });
  }

  aplicarFiltros(): void {
    if (!this.fechaInicio && !this.fechaFin && !this.distribuidorId) {
      this.cargarCompras();
      return;
    };

    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.showErrorMessage('La fecha inicial no puede ser posterior a la fecha final.', 3500);
      return;
    };

    this.cargarRecurso('filtrarCompras', this.compraService.filtrarCompras(
      this.fechaInicio || undefined,
      this.fechaFin || undefined,
      this.distribuidorId || undefined), (data) => {
      this.historial = data;
      this.hasLoadedCompras = true;
    });
  };

  get cargandoCompras(): boolean {
    return this.loadingStates['cargarCompras']
      || this.loadingStates['buscarCompraId']
      || this.loadingStates['filtrarCompras'];
  }

  limpiarBusqueda(): void {
    this.compraId = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.distribuidorId = null;
    this.cargarCompras();
  };

  abrirDetalles(compra: Compra): void {
    this.compraSeleccionada = compra;
    this.mostrarDetalles = true;
  };

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.compraSeleccionada = null;
  };
};
