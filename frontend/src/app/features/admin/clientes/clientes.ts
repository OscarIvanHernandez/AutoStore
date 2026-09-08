import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Crear } from './modal/crear/crear';
import { Editar } from './modal/editar/editar';
import { ClienteService } from '../../../services/autostore.clientes-service';
import { Abono, Cliente, DeudoresStats } from '../../../services/autostore.models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, Crear, Editar],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class Clientes implements OnInit {
  clientes: Cliente[] = [];
  stats: DeudoresStats | null = null;

  isLoading: boolean = false;
  statsLodading: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  filtroBusqueda: string = '';

  // Modales
  mostrarModalCliente: boolean = false;
  mostrarModalAbono: boolean = false;

  // Formularios
  clienteForm: Partial<Cliente> = this.resetClienteForm();
  clienteParaEditar: Cliente | null = null;
  clienteSeleccionado: Cliente | null = null;
  montoAbono: number = 0;
  historialAbonos: Abono[] = [];

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarEstadisticas();
  }

  private showSuccesMessage(message: string, duration: number): void {
    this.successMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    this.errorMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  cargarClientes(): void {
    this.isLoading = true;
    this.clienteService.listarClientes(this.filtroBusqueda).subscribe({
      next: (data) => {
        console.log("Clientes obtenidos: ", data.length);
        this.clientes = data;
        this.isLoading = false;
        this.showSuccesMessage(
          "Clientes cargados exitosamente!",
          2500
        );
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.isLoading = false;
        this.showErrorMessage(
          "Hubo un error al cargar los clientes",
          3500
        );
      }
    });
  }

  cargarEstadisticas(): void {
    this.statsLodading = true;
    this.clienteService.obtenerStatsDeudores().subscribe({
      next: (data) => {
        console.log("Estadisticas obtenidas: ", data)
        this.stats = data,
        this.statsLodading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar stats', err),
        this.statsLodading = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarCliente(): void {
    if (this.clienteForm.id) {
      this.clienteService.actualizarCliente(this.clienteForm.id, this.clienteForm).subscribe({
        next: () => {
          console.log("Cliente: ", this.clienteForm.id, " actualizado")
          this.cargarClientes();
          this.cerrarModalCliente();
          this.showSuccesMessage(
            "Datos del cliente actualizados correctamente",
            3500
          );
        },
        error: (err) => {
          console.error('Error al actualizar cliente', err);
          this.cerrarModalCliente();
          this.showErrorMessage(
            `Error al actualizar cliente: (${err.status})`,
            3500
          );
        }
      });
    } else {
      this.clienteService.crearCliente(this.clienteForm).subscribe({
        next: () => {
          console.log("Cliente creado correctamente")
          this.cargarClientes();
          this.cerrarModalCliente();
          this.showSuccesMessage(
            "Cliente creado correctamente.",
            3500
          );
        },
        error: (err) => {
          console.log('Error al crear cliente', err);
          this.cerrarModalCliente();
          this.showErrorMessage(
            `Error al crear cliente: (${err.status})`,
            3500
          );
        }
      });
    }
  }

  guardarClienteDesdeModal(cliente: Partial<Cliente>): void {
    this.clienteForm = cliente;
    this.guardarCliente();
  }
  /*guardarCliente(): void {
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
  }*/

  eliminarCliente(id: number): void {
    if (confirm('¿Desea desactivar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          console.log('Cliente: ', id, " desactivado correctamente");
          this.cargarClientes();
          this.showSuccesMessage(
            'Cliente desactivado',
            3500
          )
        },
        error: (err) => {
          console.log('Error al desactivar cliente:',err);
          this.showErrorMessage(
            `Error al desactivar cliente: (${err.status})`,
            3500
          );
        }
      });
    }
  }

  activarCliente(id: number): void {

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
        this.showSuccesMessage(
          `Abono acreditado para cliente(${this.clienteSeleccionado?.id}): (${this.clienteSeleccionado?.nombre})`,
          3500
        );
      },
      error: (err) => {
        console.log('Error al procesar abono', err)
        this.showErrorMessage(
          `Erro al acreditar abono para (${this.clienteSeleccionado?.nombre}): (${err.error?.message})`,
          3500
        );
      }
    });
  }

  liquidarDeuda(): void {
    if (this.clienteSeleccionado) {
      this.montoAbono = this.clienteSeleccionado.deudaActual;
      this.procesarAbono();
    }
  }

  abrirModalEditar(cliente: Cliente): void {
    this.clienteParaEditar = { ...cliente };
    this.clienteForm = { ...cliente };
    this.mostrarModalCliente = true;
  }

  abrirModalNuevo(): void {
    this.clienteParaEditar = null;
    this.clienteForm = this.resetClienteForm();
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
    this.clienteParaEditar = null;
    this.clienteForm = this.resetClienteForm();
  }

  cerrarModalAbono(): void {
    this.mostrarModalAbono = false;
    this.clienteSeleccionado = null;
  }

  private resetClienteForm(): Partial<Cliente> {
    return { nombre: '', telefono: '', correo: '', direccion: '', limiteCredito: 0 };
  }
}
