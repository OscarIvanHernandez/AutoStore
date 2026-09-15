import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Compra } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles.html',
  styleUrl: './detalles.css',
})
export class Detalles {
  @Input() visible = false;
  @Input() compra: Compra | null = null;
  @Output() close = new EventEmitter<void>();

  cerrar(): void {
    this.close.emit();
  }
}
