import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar.html',
  styleUrl: './agregar.css',
})
export class Agregar {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Distribuidor>>();

  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  guardar(): void {
    this.save.emit({...this.distribuidorForm});
  }

  cerrar(): void {
    this.close.emit();
  }


  private resetForm(): Partial<Distribuidor> {
    return { nombre: '', telefono: '', contacto: '' };
  }
}
