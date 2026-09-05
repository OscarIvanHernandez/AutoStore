import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.css'],
})
export class Editar implements OnChanges {
  @Input() visible = false;
  @Input() cliente: Cliente | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Cliente>();

  clienteForm: Partial<Cliente> = this.resetClienteForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) {
      this.clienteForm = this.cliente ? { ...this.cliente } : this.resetClienteForm();
    }
  }

  guardarCambios(): void {
    if (!this.clienteForm.id) {
      return;
    }

    const payload: Cliente = {
      ...this.cliente,
      ...this.clienteForm,
      nombre: this.clienteForm.nombre?.trim() ?? '',
      telefono: this.clienteForm.telefono?.trim() ?? '',
      correo: this.clienteForm.correo?.trim() || undefined,
      direccion: this.clienteForm.direccion?.trim() || undefined,
      limiteCredito: Number(this.clienteForm.limiteCredito ?? 0),
      deudaActual: Number(this.clienteForm.deudaActual ?? this.cliente?.deudaActual ?? 0),
      activo: this.clienteForm.activo ?? this.cliente?.activo ?? true,
    } as Cliente;

    this.save.emit(payload);
    this.cerrar();
  }

  cerrar(): void {
    this.close.emit();
  }

  private resetClienteForm(): Partial<Cliente> {
    return {
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      limiteCredito: 0,
      activo: true,
    };
  }
}
