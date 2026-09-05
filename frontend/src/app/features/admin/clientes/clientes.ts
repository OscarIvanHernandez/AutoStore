import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ClienteService } from '../../../services/autostore.clientes-service';
import { Abono, Cliente, DeudoresStats } from '../../../services/autostore.models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class Clientes implements OnInit {
  clientes: Cliente[] = [];
  stats: DeudoresStats | null = null;

  filtroBusqueda: string = '';
  cargando: boolean = false;

  // Modales
  mostrarModalCliente: boolean = false;
  mostrarModalAbono: boolean = false;

  // Formularios
  clienteForm: Partial<Cliente> = this.resetClienteForm();
  clienteSeleccionado: Cliente | null = null;
  montoAbono: number = 0;
  historialAbonos: Abono[] = [];

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarEstadisticas();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.listarClientes(this.filtroBusqueda).subscribe({
      next: (data) => {
        this.clientes = data;
        this.cargando = false;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  cargarEstadisticas(): void {
    this.clienteService.obtenerStatsDeudores().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error al cargar stats', err)
    });
  }

  guardarCliente(): void {
    if (this.clienteForm.id) {
      this.clienteService.actualizarCliente(this.clienteForm.id, this.clienteForm).subscribe(() => {
        this.cargarClientes();
        this.cerrarModalCliente();
      });
    } else {
      this.clienteService.crearCliente(this.clienteForm).subscribe(() => {
        this.cargarClientes();
        this.cerrarModalCliente();
      });
    }
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Desea desactivar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe(() => this.cargarClientes());
    }
  }

  abrirAbono(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.montoAbono = 0;
    this.clienteService.obtenerHistorialAbonos(cliente.id).subscribe((abonos) => {
      this.historialAbonos = abonos;
      this.mostrarModalAbono = true;
    });
  }

  procesarAbono(): void {
    if (!this.clienteSeleccionado || this.montoAbono <= 0) return;

    this.clienteService.registrarAbono(this.clienteSeleccionado.id, this.montoAbono).subscribe({
      next: () => {
        this.cargarClientes();
        this.cargarEstadisticas();
        this.cerrarModalAbono();
      },
      error: (err) => alert(err.error?.message || 'Error al procesar abono')
    });
  }

  liquidarDeuda(): void {
    if (this.clienteSeleccionado) {
      this.montoAbono = this.clienteSeleccionado.deudaActual;
      this.procesarAbono();
    }
  }

  abrirModalEditar(cliente: Cliente): void {
    this.clienteForm = { ...cliente };
    this.mostrarModalCliente = true;
  }

  abrirModalNuevo(): void {
    this.clienteForm = this.resetClienteForm();
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
  }

  cerrarModalAbono(): void {
    this.mostrarModalAbono = false;
    this.clienteSeleccionado = null;
  }

  private resetClienteForm(): Partial<Cliente> {
    return { nombre: '', telefono: '', correo: '', direccion: '', limiteCredito: 0 };
  }
}
