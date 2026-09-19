import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear.html',
  styleUrls: ['./crear.css'],
})
export class Crear implements OnChanges {
  @Input() visible = false;
  @Input() cliente: Partial<Cliente> | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Cliente>>();

  clienteForm: Partial<Cliente> = this.resetClienteForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) {
      this.clienteForm = this.cliente ? { ...this.cliente } : this.resetClienteForm();
    }

    if (!this.clienteForm.nombre && !this.clienteForm.telefono && !this.clienteForm.id) {
      this.clienteForm = this.resetClienteForm();
    }
  }

  guardarCambios(): void {
    const payload: Partial<Cliente> = {
      ...this.clienteForm,
      nombre: this.clienteForm.nombre?.trim() ?? '',
      telefono: this.clienteForm.telefono?.trim() ?? '',
      correo: this.clienteForm.correo?.trim() || undefined,
      direccion: this.clienteForm.direccion?.trim() || undefined,
      limiteCredito: Number(this.clienteForm.limiteCredito ?? 0),
      activo: this.clienteForm.activo ?? true,
    };

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
