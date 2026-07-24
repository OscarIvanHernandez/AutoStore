import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductoInterface } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-estado-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './estado-producto.html',
  styleUrl: './estado-producto.css',
})
export class EstadoProducto implements OnChanges {
  @Input() visible = false;
  @Input() producto: ProductoInterface | null =null;

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<ProductoInterface>();

  productoEstado: ProductoInterface | null = null;

  ngOnChanges() {
    if(this.producto) {
      this.productoEstado = {...this.producto};
    } else {
      this.productoEstado = null;
    }
  }

  guardarCambios() {
    if (this.productoEstado) {
      this.update.emit({...this.productoEstado});
    }
    this.cerrar();
  }

  cerrar() {
    this.close.emit();
  }
}
