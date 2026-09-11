import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Distribuidor } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';

@Component({
  selector: 'app-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distribuidores.html',
  styleUrl: './distribuidores.css',
})
export class Distribuidores implements OnInit{
  distribuidores: Distribuidor[] = [];
  mostrarInactivos: boolean = false;
  isLoading: boolean = false;

  successMessage: String | null = null;
  errorMessage: String | null = null;

  // Modal y Formulario
  mostrarModalDistribuidor: boolean = false;

  mostrarModal: boolean = false;
  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  constructor(
    private distribuidorService: DistribuidorService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDistribuidores();
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

  cargarDistribuidores(): void {
    this.isLoading = true;
    this.distribuidorService.listar().subscribe({
      next: (data) => {
        this.distribuidores = this.mostrarInactivos
          ? data
          : data.filter(d => d.activo);
        console.log('Distribuidores recibidos:', data);
        console.log('Distribuidores mostrados:', this.distribuidores);
        this.isLoading = false;
        setTimeout(() =>{
          this.cdr.markForCheck();
        }, 1500);
      },
      error: (err) => {
        console.error('Error al cargar distribuidores:', err);
        this.showErrorMessage(
          'Hubo un error al obtener los distribuidores',
          3500
        );
      }
    });
  }

  guardar(): void {
    if (!this.distribuidorForm.nombre || !this.distribuidorForm.telefono) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    }

    if (this.distribuidorForm.id) {
      this.distribuidorService.actualizar(this.distribuidorForm.id, this.distribuidorForm).subscribe({
        next: () => {
          this.cargarDistribuidores();
          this.cerrarModal();
        },
        error: (err) => {
          console.log('Error al actualizar el distribuidor:', err);
          this.cargarDistribuidores();
          this.cerrarModal();
          this.showErrorMessage(
            `Hubo un error al actualizar el distribuidor`,
            3500
          );
        }
      });
    } else {
      this.distribuidorService.crear(this.distribuidorForm).subscribe({
        next:() =>{
          this.cargarDistribuidores();
          this.cerrarModal();
        },
        error: (err) => {
          console.log('Error al crear distribuidor: ',err);
          this.cargarDistribuidores();
          this.cerrarModal();
          this.showErrorMessage(
            `Hubo un error al crear el distribuidor`,
            3500
          );
        }
      });
    }
  }

  desactivar(id: number): void {
    if (confirm('¿Desea desactivar este distribuidor?')) {
      this.distribuidorService.desactivar(id).subscribe({
        next: () => {
          this.cargarDistribuidores();
          this.cdr.markForCheck();
          this.showSuccesMessage(
            `Proveedor (${this.distribuidores[id].nombre}) desactivado`,
            3500
          );
        },
        error: (err) => {
          console.log('Error al desactivar distribuidor: ', err);
          this.showErrorMessage(
            `Error al desactivar proveedor (${this.distribuidores[id].nombre})`,
            3500
          );
        }
      });
    }
  }

  activar(id: number): void {
    this.distribuidorService.activar(id).subscribe({
      next: () => {
        this.cargarDistribuidores();
        this.showSuccesMessage(
          `Proveedor (${this.distribuidores[id].nombre}) activado`,
          3500
        );
      },
      error: (err) => {
        console.log('Error al activar distribuidor: ', err);
        this.showErrorMessage(
          `Error al activar proveedor (${this.distribuidores[id].nombre})`,
          3500
        );
      }
    });
  }

  abrirModalNuevo(): void {
    this.distribuidorForm = this.resetForm();
    this.mostrarModal = true;
  }

  abrirModalEditar(distribuidor: Distribuidor): void {
    this.distribuidorForm = { ...distribuidor };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  private resetForm(): Partial<Distribuidor> {
    return { nombre: '', telefono: '', contacto: '' };
  }
}
