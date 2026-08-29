import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-sale-ticket',
  styleUrl: './sale-ticket.css',
  templateUrl: './sale-ticket.html',
})
export class SaleTicket {
  @Input() visible: boolean = false;
  @Input() venta: any | null = null;
  @Input() efectivoRecibido: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() nuevaVenta = new EventEmitter<void>();

  get cambio(): number {
    if (!this.venta) {
      return 0;
    }

    return Number(this.efectivoRecibido) - Number(this.venta.total ?? 0);
  }

  imprimir() {
    window.print();
  }

  cerrarModal() {
    this.close.emit();
  }

  iniciarNuevaVenta() {
    this.nuevaVenta.emit();
  }
}
