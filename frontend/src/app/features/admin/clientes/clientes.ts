import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Crear } from './modal/crear/crear';
import { Editar } from './modal/editar/editar';
import { ClienteService } from '../../../services/autostore.clientes-service';
import { Abono, Cliente, DeudoresStats } from '../../../services/autostore.models';
import { catchError, EMPTY, of } from 'rxjs';

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
  hasError: boolean = false;
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
    this.cdr.markForCheck();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    this.errorMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  cargarClientes(): void {
    this.isLoading = true;
    this.hasError = false;
    this.clienteService.listarClientes(this.filtroBusqueda).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los clientes: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los clientes. (${error.status})`,
            3500
          );
        }
        return of([])
      })
    ).subscribe((data) =>{
      console.log("Clientes obtenidos: ", data.length);
      this.clientes = data;
      this.isLoading = false;
      this.showSuccesMessage(
        "Clientes cargados exitosamente!",
        3500
      );
    });
  }

  cargarEstadisticas(): void {
    this.statsLodading = true;
    this.hasError = false;
    this.clienteService.obtenerStatsDeudores().pipe(
      catchError((error) => {
                this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar estadisticas: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar las estadísticas. (${error.status})`,
            3500
          );
        }
        return EMPTY
      })
    ).subscribe((data) => {
        console.log("Estadisticas obtenidas: ", data)
        this.stats = data,
        setTimeout(() => {
          this.statsLodading = false;
          this.cdr.markForCheck();
        }, 500)
    });
  }

  guardarCliente(): void {
    this.isLoading = true;
    this.hasError = false;
    if (this.clienteForm.id) {
      this.clienteService.actualizarCliente(this.clienteForm.id, this.clienteForm).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al guardar cambios: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al guardar los cambios. (${error.status})`,
            3500
          );
        }
        return EMPTY
        })
      ).subscribe(() => {
        console.log("Cliente: ", this.clienteForm.id, " actualizado")
        this.cargarClientes();
        this.cerrarModalCliente();
        this.isLoading = false;
        this.showSuccesMessage(
          "Datos del cliente actualizados correctamente",
          3500
        );
      });
    } else {
      this.clienteService.crearCliente(this.clienteForm).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al crear cliente: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al guardar el nuevo cliente. (${error.status})`,
            4500
          );
        }
        return EMPTY
        })
      ).subscribe(() => {
        console.log("Cliente creado correctamente")
        this.cargarClientes();
        this.cerrarModalCliente();
        this.isLoading = false;
        this.showSuccesMessage(
          "Cliente creado correctamente.",
          3500
        );
      });
    }
  }

  guardarClienteDesdeModal(cliente: Partial<Cliente>): void {
    this.clienteForm = cliente;
    this.guardarCliente();
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Desea desactivar este cliente?')) {
      this.isLoading = true;
      this.hasError = false;
      this.clienteService.eliminarCliente(id).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al eliminar cliente: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al eliminar el cliente. (${error.status})`,
            3500
          );
        }
        return EMPTY
        })
      ).subscribe(() => {
          console.log('Cliente: ', id, " desactivado correctamente");
          this.cargarClientes();
          this.isLoading = false;
          this.showSuccesMessage(
            'Cliente desactivado!',
            3500
          );
      });
    }
  }

  activarCliente(id: number): void {
    if (confirm('¿Desea activar el cliente?')) {
      this.isLoading = true;
      this.hasError = false;
      this.clienteService.activarCliente(id).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al activar el cliente: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al activar el cliente. (${error.status})`,
            3500
          );
        }
        return EMPTY
        })
      ).subscribe(() => {
        this.cargarClientes();
        this.isLoading = false;
        this.showSuccesMessage(
          `Cliente activado!`,
          3500
        );
      });
    }
  }

  abrirAbono(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.montoAbono = 0;
    this.isLoading = true;
    this.hasError = false;
    this.clienteService.obtenerHistorialAbonos(cliente.id).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al obtener el historial de abonos: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al obtener el historial de abonos. (${error.status})`,
            4500
          );
        }
        return EMPTY;
      })
    ).subscribe((data) => {
      this.historialAbonos = data;
      this.isLoading = false;
      this.mostrarModalAbono = true;
    });
  }

  procesarAbono(): void {
    if (!this.clienteSeleccionado || this.montoAbono <= 0) return;
    this.isLoading = true;
    this.hasError = false;
    this.clienteService.registrarAbono(this.clienteSeleccionado.id, this.montoAbono).pipe(
      catchError((error) =>{
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al procesar el abono: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al procesar el abono. (${error.status})`,
            3500
          );
        }
        return EMPTY
      })
    ).subscribe(() =>{
      this.cargarClientes();
      this.cargarEstadisticas();
      this.cerrarModalAbono();
      this.isLoading = false;
      this.showSuccesMessage(
        `Abono acreditado para cliente(${this.clienteSeleccionado?.id}): (${this.clienteSeleccionado?.nombre})`,
        3500
      );
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
