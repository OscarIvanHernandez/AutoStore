import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Compra } from '../../../services/autostore.models';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';

@Component({
  selector: 'app-historico-mercancia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-mercancia.html',
  styleUrl: './historico-mercancia.css',
})
export class HistoricoMercancia implements OnInit{
  //Compras y sus detalles
  historial: Compra[] = [];

  isLoading: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  constructor(
    private compraService: CompraDistribuidorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

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

  cargarCompras(): void {
    this.isLoading = true;
    this.compraService.listarCompras().subscribe({
      next: (data) => {
        this.historial = data;
        console.log('Compras cargadas: ', data.length);
        this.isLoading = false;
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 1500);
      },
      error: (err) => {
        console.log('Error al cargar las compras: ', err);
        this.showErrorMessage(
          `Hubo un error al cargar las compras: (${err.error?.message})`,
        3500);
      },
    });
  }
}
