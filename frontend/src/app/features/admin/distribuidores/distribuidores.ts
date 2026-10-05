import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { BaseComponent } from '../base-component/base-component';
import { Agregar } from './modal/agregar/agregar';
import { Editar } from './modal/editar/editar';

@Component({
  selector: 'app-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule, Agregar, Editar],
  templateUrl: './distribuidores.html',
  styleUrl: './distribuidores.css',
})
export class Distribuidores extends BaseComponent implements OnInit {
  distribuidores: Distribuidor[] = [];
  mostrarInactivos = false;
  hasLoadedDistribuidores = false;
  mostrarModalAgregar = false;
  mostrarModalEditar = false;
  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  constructor(
    private distribuidorService: DistribuidorService,
    cdr: ChangeDetectorRef
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.cargarDistribuidores();
  }

  cargarDistribuidores(): void {
    this.cargarRecurso(
      'cargaDistribuidores',
      this.distribuidorService.listar(),
      (data) => {
        this.distribuidores = this.mostrarInactivos ? data : data.filter((distribuidor) => distribuidor.activo);
        this.hasLoadedDistribuidores = true;
      },
      'los distribuidores'
    );
  }

  guardar(distribuidor: Partial<Distribuidor>): void {
    const nombre = distribuidor.nombre?.trim();
    const telefono = distribuidor.telefono?.trim();
    if (!nombre || !telefono) {
      this.showErrorMessage('Nombre y teléfono son obligatorios.');
      return;
    }

    const datos = { ...distribuidor, nombre, telefono };
    const id = datos.id;
    const esEdicion = id !== undefined;
    const request = id !== undefined
      ? this.distribuidorService.actualizar(id, datos)
      : this.distribuidorService.crear(datos);

    this.ejecutarMutacion(request, esEdicion ? 'actualizar distribuidor' : 'crear distribuidor', () => {
      this.cerrarModalAgregar();
      this.cerrarModalEditar();
      this.showSuccessMessage(esEdicion ? 'Distribuidor actualizado correctamente.' : 'Distribuidor creado correctamente.');
      this.cargarDistribuidores();
    });
  }

  desactivar(id: number): void {
    const distribuidor = this.distribuidores.find((item) => item.id === id);
    if (!distribuidor || !confirm(`¿Desea desactivar a ${distribuidor.nombre}?`)) return;

    this.ejecutarMutacion(this.distribuidorService.desactivar(id), 'desactivar distribuidor', () => {
      this.showSuccessMessage(`Distribuidor ${distribuidor.nombre} desactivado.`);
      this.cargarDistribuidores();
    });
  }

  activar(id: number): void {
    const distribuidor = this.distribuidores.find((item) => item.id === id);
    if (!distribuidor || !confirm(`¿Desea reactivar a ${distribuidor.nombre}?`)) return;

    this.ejecutarMutacion(this.distribuidorService.activar(id), 'activar distribuidor', () => {
      this.showSuccessMessage(`Distribuidor ${distribuidor.nombre} reactivado.`);
      this.cargarDistribuidores();
    });
  }

  abrirModalNuevo(): void {
    this.distribuidorForm = this.resetForm();
    this.mostrarModalAgregar = true;
  }

  abrirModalEditar(distribuidor: Distribuidor): void {
    this.distribuidorForm = { ...distribuidor };
    this.mostrarModalEditar = true;
  }

  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
  }

  private resetForm(): Partial<Distribuidor> {
    return { nombre: '', telefono: '', contacto: '' };
  }
}
