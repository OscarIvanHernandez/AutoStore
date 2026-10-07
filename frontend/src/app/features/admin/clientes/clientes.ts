import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Crear } from './modal/crear/crear';
import { Editar } from './modal/editar/editar';
import { ClienteService } from '../../../services/autostore.clientes-service';
import { Abono, Cliente, DeudoresStats } from '../../../services/autostore.models';
import { BaseComponent } from '../base-component/base-component';
import { ActivatedRoute } from '@angular/router';

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
  hasLoadedClientes = false;
  hasLoadedStats = false;

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

  // Variables para los filtro de busqueda
  textoBusqueda: string  = '';
  estadoSeleccionado: string  = '';
  private filtrosIniciales: { q?: string; telefono?: string; direccion?: string; activo?: boolean } | null = null;

  constructor(
    private clienteService: ClienteService,
    cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {super(cdr);};

  ngOnInit(): void {
    this.cargarEstadisticas();

    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      const telefono = params['telefono'];
      const direccion = params['direccion'];
      const estado = params['estado'];
      const activoParam = params['activo'];
      const activo = activoParam === undefined ? undefined : activoParam === 'true';
      this.filtroBusqueda = typeof q === 'string' ? q : '';

      if (q || telefono || direccion || estado || activoParam !== undefined) {
        if (estado?.trim()) {
          this.estadoSeleccionado = estado.trim();
        }

        this.filtrosIniciales = { q, telefono, direccion, activo };
        this.buscarClientes(this.filtrosIniciales);
      } else {
        this.cargarClientes();
        this.filtrosIniciales = null;
      };
    });
  };

  cargarClientes(): void {
    this.cargarRecurso('cargarClientes', this.clienteService.listarClientes(this.filtroBusqueda), (data) => {
      console.log("Clientes obtenidos: ", data.length);
      this.clientes = data;
      this.hasLoadedClientes = true;
    });
  };

  cargarEstadisticas(): void {
    this.cargarRecurso('cargarEstadisticas', this.clienteService.obtenerStatsDeudores(), (data) => {
      console.log("Estadisticas obtenidas: ", data);
      this.stats = data;
      this.hasLoadedStats = true;
    });
  };

  guardarCliente(): void {
    if (this.clienteForm.id) {
      this.ejecutarMutacion(this.clienteService.actualizarCliente(
      this.clienteForm.id, this.clienteForm), 'actualizar cliente', () => {
        console.log("Cliente: ", this.clienteForm.id, " actualizado")
        this.cargarClientes();
        this.cerrarModalCliente();
        this.showSuccessMessage(
          "Datos del cliente actualizados correctamente"
        );
      });
    } else {
      this.ejecutarMutacion(this.clienteService.crearCliente(this.clienteForm), 'crear cliente', () => {
        console.log("Cliente creado correctamente")
        this.cargarClientes();
        this.cerrarModalCliente();
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
      this.ejecutarMutacion(this.clienteService.eliminarCliente(id), 'desactivar cliente', () => {
        console.log('Cliente: ', id, " desactivado correctamente");
        this.cargarClientes();
        this.showSuccessMessage(
          'Cliente desactivado!'
        );
      });
    };
  };

  private buscarClientes(filtros: { q?: string; telefono?: string; direccion?: string; activo?: boolean }): void {
    this.cargarRecurso('buscarClientes', this.clienteService.buscar(filtros), (data) => {
      this.clientes = data;
      this.hasLoadedClientes = true;
    });
  };

  activarCliente(id: number): void {
    if (confirm('¿Desea activar el cliente?')) {
      this.ejecutarMutacion(this.clienteService.activarCliente(id), 'activar cliente', () => {
        this.cargarClientes();
        this.showSuccessMessage(
          `Cliente activado!`
        );
      });
    };
  };

  obtenerAbonos(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.montoAbono = 0;
    this.historialAbonos = [];
    this.mostrarModalAbono = true;
    this.cargarRecurso('cargarAbonos', this.clienteService.obtenerHistorialAbonos(cliente.id), (data) => {
      this.historialAbonos = data;
    });
  };

  procesarAbono(): void {
    if (!this.clienteSeleccionado || this.montoAbono <= 0) return;
    const cliente = this.clienteSeleccionado;
    this.ejecutarMutacion(this.clienteService.registrarAbono(
      cliente.id,
      this.montoAbono
    ), 'procesar abono',() => {
      this.cargarClientes();
      this.cargarEstadisticas();
      this.cerrarModalAbono();
      this.showSuccessMessage(
        `Abono acreditado para cliente (${cliente.id}): ${cliente.nombre}.`
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
