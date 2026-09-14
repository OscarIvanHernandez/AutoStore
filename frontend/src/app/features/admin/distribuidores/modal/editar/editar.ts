import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar.html',
  styleUrl: './editar.css',
})
export class Editar implements OnChanges {
  @Input() visible = false;
  @Output() distribuidor: Distribuidor | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<Distribuidor>();

  distribuidorEdit: Distribuidor | null = null;

  ngOnChanges(): void {
    if (this.distribuidor) {
      this.distribuidorEdit = {...this.distribuidor};
    } else {
      this.distribuidorEdit = null;
    }
  }

  guardar(): void {
    if (this.distribuidorEdit) {
      this.update.emit({...this.distribuidorEdit})
    }
  }

  cerrar(): void {
    this.close.emit();
  }
}
