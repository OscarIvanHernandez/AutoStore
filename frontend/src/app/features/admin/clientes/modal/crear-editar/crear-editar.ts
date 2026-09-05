import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cliente } from '../../../../../services/autostore.models';

@Component({
  selector: 'app-crear-editar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crear-editar.html',
  styleUrl: './crear-editar.css',
})
export class CrearEditar {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Cliente>();


}
