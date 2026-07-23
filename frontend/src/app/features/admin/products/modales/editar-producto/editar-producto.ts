import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductoInterface } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './editar-producto.html',
  styleUrls: ['./editar-producto.css'],
})
export class EditarProducto implements OnChanges{
  @Input() visible = false;
  @Input() producto: ProductoInterface | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<ProductoInterface>();

  productoEditar: ProductoInterface | null = null;

  ngOnChanges(){
    if(this.producto) {
      this.productoEditar = { ...this.producto };
    } else {
      this.productoEditar = null;
    }
  }

  guardarCambios() {
    if (this.productoEditar) {
      this.update.emit({ ...this.productoEditar });
    }
    this.cerrar();
  }

  cerrar() {
    this.close.emit();
  }

}
