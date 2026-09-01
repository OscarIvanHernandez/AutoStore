import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja.html',
  styleUrl: './caja.css',
})
export class Caja {
  @Input() visible = false;
  @Input() tipo: 'apertura' | 'cierre' = 'apertura';
  @Input() efectivoInicial = 0;
  @Input() efectivoReal = 0;

  @Output() close = new EventEmitter<void>();
  @Output() confirmApertura = new EventEmitter<number>();
  @Output() confirmCierre = new EventEmitter<number>();

  confirmarApertura(): void {
    this.confirmApertura.emit(Number(this.efectivoInicial));
  }

  confirmarCierre(): void {
    this.confirmCierre.emit(Number(this.efectivoReal));
  }

  cerrar(): void {
    this.close.emit();
  }
}
