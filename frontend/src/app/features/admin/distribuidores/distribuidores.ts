import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Agregar } from './modal/agregar/agregar';
import { Editar } from './modal/editar/editar';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule, Agregar, Editar],
  templateUrl: './distribuidores.html',
  styleUrl: './distribuidores.css',
})
export class Distribuidores extends BaseComponent implements OnInit{
  distribuidores: Distribuidor[] = [];
  mostrarInactivos: boolean = false;

  // Modal y Formulario
  mostrarModalDistribuidor: boolean = false;

  hasLoadedDistribuidores: boolean = false;

  mostrarModalAgregar: boolean = false;
  mostrarModalEditar: boolean = false;
  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  constructor(
    private distribuidorService: DistribuidorService,
    cdr: ChangeDetectorRef)
    {super(cdr);};

  ngOnInit(): void {
    this.cargarDistribuidores();
  };

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.hasLoadedDistribuidores = false;
    this.cargarRecurso('cargaDistribuidores', this.distribuidorService.listar(), (data) => {
      this.distribuidores = this.mostrarInactivos
        ? data
        : data.filter(d => d.activo);
      console.log('Distribuidores recibidos:', data);
      console.log('Distribuidores mostrados:', this.distribuidores);
      this.hasLoadedDistribuidores = true;
      this.isLoading = false;
      setTimeout(() =>{
        this.cdr.detectChanges();
      }, 500);
    });
  };

  guardar(distribuidor: Partial<Distribuidor>): void {
    if (!distribuidor.nombre || !distribuidor.telefono) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    };
    this.isLoading = true;
    if (distribuidor.id) {
      this.ejecutarMutacion(this.distribuidorService.actualizar(distribuidor.id, distribuidor), 'actualizar distribuidor' ,() =>{
        this.cargarDistribuidores();
        this.cerrarModalEditar();
        distribuidor = this.resetForm();
        this.isLoading = false;
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 500);
      });
    } else {
      this.ejecutarMutacion(this.distribuidorService.crear(distribuidor), 'crear distribuidor', () => {
        this.cargarDistribuidores();
        this.cerrarModalAgregar();
        distribuidor = this.resetForm();
        this.isLoading = false;
        setTimeout(() =>{
          this.cdr.detectChanges();
        }, 500);
      });
    };
  };

  desactivar(id: number): void {
    if (confirm('¿Desea desactivar este distribuidor?')) {
      this.isLoading = true;
      this.ejecutarMutacion(this.distribuidorService.desactivar(id), 'desactivar distribuidor', () => {
        this.cargarDistribuidores();
        this.isLoading = false;
        this.showSuccessMessage(
          `Proveedor (${this.distribuidores[id].nombre}) desactivado`,
        );
      });
    };
  };

  activar(id: number): void {
    if (confirm('¿Desea activar este distribuidor?')) {
      this.isLoading = true;
      this.ejecutarMutacion(this.distribuidorService.activar(id), 'activar distribuidor', () => {
        this.cargarDistribuidores();
        this.isLoading = false;
        this.showSuccessMessage(
          `Proveedor (${this.distribuidores[id].nombre}) activado`
        );
      });
    };
  };

  abrirModalNuevo(): void {
    this.mostrarModalAgregar = true;
  };

  abrirModalEditar(distribuidor: Distribuidor): void {
    this.distribuidorForm = { ...distribuidor };
    this.mostrarModalEditar = true;
  };

  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
  };

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
  };

  private resetForm(): Partial<Distribuidor> {
    return { nombre: '', telefono: '', contacto: '' };
  };
};
