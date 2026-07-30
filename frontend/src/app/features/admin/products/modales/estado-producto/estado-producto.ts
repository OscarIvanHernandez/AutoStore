import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EstadoProductoInterface } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-estado-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './estado-producto.html',
  styleUrl: './estado-producto.css',
})
export class EstadoProducto implements OnChanges {
  @Input() visible = false;
  @Input() productoEstado: EstadoProductoInterface | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<EstadoProductoInterface>();

  productoActualEstado: EstadoProductoInterface | null = null;
  productoNuevoEstado: EstadoProductoInterface | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoEstado'] && this.productoEstado) {
      this.productoActualEstado = this.crearVistaEstado(this.productoEstado);
      this.productoNuevoEstado = this.crearVistaEstado(this.productoEstado);
    } else if (!this.productoEstado) {
      this.productoActualEstado = null;
      this.productoNuevoEstado = null;
    }
  }

  private crearVistaEstado(productoEstado: EstadoProductoInterface): EstadoProductoInterface {
    return {
      id: productoEstado.id,
      nombre: productoEstado.nombre,
      activo: productoEstado.activo ?? true,
    };
  }

  guardarCambios() {
    if (this.productoEstado && this.productoNuevoEstado) {
      const productoActualizado: EstadoProductoInterface = {
        id: this.productoEstado.id,
        nombre: this.productoEstado.nombre,
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
