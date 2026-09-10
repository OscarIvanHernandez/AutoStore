import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  cargando: boolean = false;

  // Modal y Formulario
  mostrarModal: boolean = false;
  distribuidorForm: Partial<Distribuidor> = this.resetForm();

  constructor(private distribuidorService: DistribuidorService) {}

  ngOnInit(): void {
    this.cargarDistribuidores();
  }

  cargarDistribuidores(): void {
    this.cargando = true;
    this.distribuidorService.listar().subscribe({
      next: (data) => {
        this.distribuidores = this.mostrarInactivos
          ? data
          : data.filter(d => d.activo);
        this.cargando = false;
      },
      error: (err) => console.error('Error al cargar distribuidores:', err)
    });
  }

  guardar(): void {
    if (!this.distribuidorForm.nombre || !this.distribuidorForm.telefono) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    }

    if (this.distribuidorForm.id) {
      this.distribuidorService.actualizar(this.distribuidorForm.id, this.distribuidorForm).subscribe(() => {
        this.cargarDistribuidores();
        this.cerrarModal();
      });
    } else {
      this.distribuidorService.crear(this.distribuidorForm).subscribe(() => {
        this.cargarDistribuidores();
        this.cerrarModal();
      });
    }
  }

  desactivar(id: number): void {
    if (confirm('¿Desea desactivar este distribuidor?')) {
      this.distribuidorService.desactivar(id).subscribe(() => this.cargarDistribuidores());
    }
  }

  activar(id: number): void {
    this.distribuidorService.activar(id).subscribe(() => this.cargarDistribuidores());
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
