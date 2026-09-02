import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CorteCaja } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-corte-detalle-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corte-detalle-ticket.html',
  styleUrl: './corte-detalle-ticket.css',
})
export class CorteDetalleTicket {
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
