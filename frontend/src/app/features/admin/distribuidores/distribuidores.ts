import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Agregar } from './modal/agregar/agregar';
import { Editar } from './modal/editar/editar';
import { catchError, EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule, Agregar, Editar],
  templateUrl: './distribuidores.html',
  styleUrl: './distribuidores.css',
})
export class Distribuidores implements OnInit{
  distribuidores: Distribuidor[] = [];
  mostrarInactivos: boolean = false;

  isLoading: boolean = false;
  hasError: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  // Modal y Formulario
  mostrarModalDistribuidor: boolean = false;

  mostrarModalAgregar: boolean = false;
  mostrarModalEditar: boolean = false;
  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  constructor(
    private distribuidorService: DistribuidorService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDistribuidores();
  }

  private showSuccesMessage(message: string, duration = 2500): void {
    this.successMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration = 3500): void {
    this.errorMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.hasError = false;
    this.distribuidorService.listar().pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al cargar los distribuidores : ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al cargar los distribuidores . (${error.status})`,
            4500
          );
        };
        return of([]);
      })
    ).subscribe((data) => {
      this.distribuidores = this.mostrarInactivos
        ? data
        : data.filter(d => d.activo);
      console.log('Distribuidores recibidos:', data);
      console.log('Distribuidores mostrados:', this.distribuidores);
      setTimeout(() =>{
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }

  guardar(distribuidor: Partial<Distribuidor>): void {
    if (!distribuidor.nombre || !distribuidor.telefono) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    };
    this.isLoading = true;
    this.hasError = false;
    if (distribuidor.id) {
      this.distribuidorService.actualizar(distribuidor.id, distribuidor).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        distribuidor = this.resetForm();
        this.cerrarModalEditar();
        console.log('Error al guardar los cambios: ', error);
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
        };
        return EMPTY;
        })
      ).subscribe(() => {
        this.cargarDistribuidores();
        this.cerrarModalEditar();
        distribuidor = this.resetForm();
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500)
      });
    } else {
      this.distribuidorService.crear(distribuidor).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        distribuidor = this.resetForm();
        this.cerrarModalAgregar();
        console.log('Error al agrear el distribuidor: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al agregar el distribuidor. (${error.status})`,
            3500
          );
        };
        return EMPTY;
        })
      ).subscribe(() =>{
        this.cargarDistribuidores();
        this.cerrarModalAgregar();
        distribuidor = this.resetForm();
        setTimeout(() =>{
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
      });
    };
  }

  desactivar(id: number): void {
    if (confirm('¿Desea desactivar este distribuidor?')) {
      this.isLoading = true;
      this.hasError = false;
      this.distribuidorService.desactivar(id).pipe(
        catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al desactivar el distribuidor: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al desactivar el distribuidor. (${error.status})`,
            4500
          );
        };
        return EMPTY;
        })
      ).subscribe(() => {
        this.cargarDistribuidores();
        this.isLoading = false;
        this.showSuccesMessage(
          `Proveedor (${this.distribuidores[id].nombre}) desactivado`,
          3500
        );
      });
    };
  }

  activar(id: number): void {
    if (confirm('¿Desea activar este distribuidor?')) {
      this.isLoading = true;
      this.hasError = false;
      this.distribuidorService.activar(id).pipe(
        catchError((error) => {
          this.hasError = true;
          this.isLoading = false;
          console.log('Error al activar el distribuidor: ', error);
          if (error.status === 0){
            this.showErrorMessage(
              `No se pudo conectar con el servidor.`,
              3500
            );
          } else {
            this.showErrorMessage(
              `Ocurrió un error al activar el distribuidor. (${error.status})`,
              4500
            );
          };
          return EMPTY;
        })
      ).subscribe(() => {
        this.cargarDistribuidores();
        this.isLoading = false;
        this.showSuccesMessage(
          `Proveedor (${this.distribuidores[id].nombre}) activado`,
          3500
        );
      });
    };
  }

  abrirModalNuevo(): void {
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
