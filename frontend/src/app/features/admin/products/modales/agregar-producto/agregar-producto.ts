import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProductoInterface } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './agregar-producto.html',
  styleUrls: ['./agregar-producto.css'],
})
export class AgregarProducto {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<ProductoInterface>();

  nuevoProducto: ProductoInterface = this.resetearFormulario();

  guardar() {
    this.save.emit({ ...this.nuevoProducto });
    this.resetearFormulario();
  }

  cerrar() {
    this.resetearFormulario();
    this.close.emit();
  }

  private resetearFormulario(): ProductoInterface {
    return {
      nombre: '',
      marca: '',
      categoria: '',
      proveedor: '',
      precioCompra: 0,
      precioVentaMostrador: 0,
      precioVentaTaller: 0,
      stockActual: 0,
      stockMinimo: 0,
    };
  }
}
