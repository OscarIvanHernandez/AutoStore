import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
  @Input() producto: ProductoInterface | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<ProductoInterface>();

  productoActualEstado: ProductoInterface | null = null;
  productoNuevoEstado: ProductoInterface | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto) {
      this.productoActualEstado = this.crearVistaEstado(this.producto);
      this.productoNuevoEstado = this.crearVistaEstado(this.producto);
    } else if (!this.producto) {
      this.productoActualEstado = null;
      this.productoNuevoEstado = null;
    }
  }

  private crearVistaEstado(producto: ProductoInterface): ProductoInterface {
    return {
      ...producto,
      activo: producto.activo ?? true,
    };
  }

  guardarCambios() {
    if (this.producto && this.productoNuevoEstado) {
      const productoActualizado: ProductoInterface = {
        ...this.producto,
        ...this.productoNuevoEstado,
        activo: this.productoNuevoEstado.activo,
      };

      this.update.emit(productoActualizado);
    }

    this.productoActualEstado = null;
    this.productoNuevoEstado = null;
    this.cerrar();
  }

  cerrar() {
    this.close.emit();
  }
}
