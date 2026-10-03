import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Crear } from './modal/crear/crear';
import { Editar } from './modal/editar/editar';
import { ClienteService } from '../../../services/autostore.clientes-service';
import { Abono, Cliente, DeudoresStats } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, Crear, Editar],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class Clientes extends BaseComponent implements OnInit {
  clientes: Cliente[] = [];
  stats: DeudoresStats | null = null;
  statsLodading: boolean = false;

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
    cdr: ChangeDetectorRef
  ) {super(cdr);};

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarEstadisticas();
  };

  cargarClientes(): void {
    this.isLoading = true;
    this.cargarRecurso('cargarClientes', this.clienteService.listarClientes(this.filtroBusqueda), (data) => {
      console.log("Clientes obtenidos: ", data.length);
      this.clientes = data;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  };

  cargarEstadisticas(): void {
    this.statsLodading = true;
    this.cargarRecurso('cargarEstadisticas', this.clienteService.obtenerStatsDeudores(), (data) => {
      console.log("Estadisticas obtenidas: ", data)
        this.stats = data,
        this.statsLodading = false;
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 500);
    });
  };

  guardarCliente(): void {
    this.isLoading = true;
    if (this.clienteForm.id) {
      this.ejecutarMutacion(this.clienteService.actualizarCliente(
      this.clienteForm.id, this.clienteForm), 'actualizar cliente', () => {
        console.log("Cliente: ", this.clienteForm.id, " actualizado")
        this.cargarClientes();
        this.cerrarModalCliente();
        this.isLoading = false;
        this.showSuccessMessage(
          "Datos del cliente actualizados correctamente"
        );
      });
    } else {
      this.ejecutarMutacion(this.clienteService.crearCliente(this.clienteForm), 'crear cliente', () => {
        console.log("Cliente creado correctamente")
        this.cargarClientes();
        this.cerrarModalCliente();
        this.isLoading = false;
        this.showSuccessMessage(
          "Cliente creado correctamente."
        );
      });
    };
  };

  guardarClienteDesdeModal(cliente: Partial<Cliente>): void {
    this.clienteForm = cliente;
    this.guardarCliente();
  };

  eliminarCliente(id: number): void {
    if (confirm('¿Desea desactivar este cliente?')) {
      this.isLoading = true;
      this.ejecutarMutacion(this.clienteService.eliminarCliente(id), 'desactivar cliente', () => {
        console.log('Cliente: ', id, " desactivado correctamente");
        this.cargarClientes();
        this.isLoading = false;
        this.showSuccessMessage(
          'Cliente desactivado!'
        );
      });
    };
  };

  activarCliente(id: number): void {
    if (confirm('¿Desea activar el cliente?')) {
      this.isLoading = true;
      this.ejecutarMutacion(this.clienteService.activarCliente(id), 'activar cliente', () => {
        this.cargarClientes();
        this.isLoading = false;
        this.showErrorMessage(
          `Cliente activado!`
        );
      });
    };
  };

  obtenerAbonos(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.montoAbono = 0;
    this.isLoading = true;
    this.cargarRecurso('cargarAbonos', this.clienteService.obtenerHistorialAbonos(cliente.id), (data) => {
      this.historialAbonos = data;
      this.isLoading = false;
      this.mostrarModalAbono = true;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
    });
  };

  procesarAbono(): void {
    if (!this.clienteSeleccionado || this.montoAbono <= 0) return;
    this.isLoading = true;
    this.ejecutarMutacion(this.clienteService.registrarAbono(
      this.clienteSeleccionado.id,
      this.montoAbono
    ), 'procesar abono',() => {
      this.cargarClientes();
      this.cargarEstadisticas();
      this.cerrarModalAbono();
      this.isLoading = false;
      this.showSuccessMessage(
        `Abono acreditado para cliente
        (${this.clienteSeleccionado?.id}): (${this.clienteSeleccionado?.nombre})`
      );
    });
  };

  liquidarDeuda(): void {
    if (this.clienteSeleccionado) {
      this.montoAbono = this.clienteSeleccionado.deudaActual;
      this.procesarAbono();
    };
  };

  abrirModalEditar(cliente: Cliente): void {
    this.clienteParaEditar = { ...cliente };
    this.clienteForm = { ...cliente };
    this.mostrarModalCliente = true;
  };

  abrirModalNuevo(): void {
    this.clienteParaEditar = null;
    this.clienteForm = this.resetClienteForm();
    this.mostrarModalCliente = true;
  };

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
    this.clienteParaEditar = null;
    this.clienteForm = this.resetClienteForm();
  };

  cerrarModalAbono(): void {
    this.mostrarModalAbono = false;
    this.clienteSeleccionado = null;
  };

  private resetClienteForm(): Partial<Cliente> {
    return { nombre: '', telefono: '', correo: '', direccion: '', limiteCredito: 0 };
  };
};
