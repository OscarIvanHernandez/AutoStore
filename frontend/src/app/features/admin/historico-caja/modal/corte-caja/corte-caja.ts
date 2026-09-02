import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-corte-caja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corte-caja.html',
  styleUrl: './corte-caja.css',
})
export class CorteCaja {
  @Input() visible: boolean = false;
  @Input() corte: CorteCaja | null = null;
  @Output() close = new EventEmitter<void>();

  imprimir(): void {
    window.print();
  }

  cerrar(): void {
    this.close.emit();
  }
}
