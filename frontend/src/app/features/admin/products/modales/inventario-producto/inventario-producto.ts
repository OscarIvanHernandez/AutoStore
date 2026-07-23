import { CommonModule } from '@angular/common';
import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AjusteRequestInterface, ProductoInterface } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-inventario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './inventario-producto.html',
  styleUrl: './inventario-producto.css',
})
export class InventarioProducto implements OnChanges{
  @Input() visible = false;
  @Input() producto: ProductoInterface | null = null;

  @Output() close = new EventEmitter<void>();
  // Se define el tipo del evento como un objeto que lleva ambas interfaces
  @Output() update = new EventEmitter<{producto: ProductoInterface, ajuste: AjusteRequestInterface}>();

  productoAjustar: ProductoInterface | null = null;
  nuevoAjuste: AjusteRequestInterface = this.resetearAjuste();

  ngOnChanges(){
    if(this.producto) {
      this.productoAjustar = {...this.producto};
    } else {
      this.productoAjustar = null;
    }
  }

  private resetearAjuste(): AjusteRequestInterface{
      return{
      tipo: 'ENTRADA',
      cantidad: 0,
      motivo: ''
      }
    }

  guardarCambios() {
    if (this.productoAjustar) {
      this.update.emit({
        producto: this.productoAjustar,
        ajuste: this.nuevoAjuste
      });
      this.nuevoAjuste = this.resetearAjuste();
    }
    this.cerrar();
  }

  cerrar() {
    this.close.emit();
  }
}
