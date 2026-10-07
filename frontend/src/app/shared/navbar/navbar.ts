import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Definicion de un modelo para "contexto de busqeda"
interface ContextoBusqueda{
  id: string;
  nombre: string;       // Lo que el usuario ve en el menú (ej: "Productos")
  ruta: string;         // A dónde va a navegar
  placeholder: string;  // El texto ejemplo
}

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  terminoBusqueda: string | null = null;
  fechaActual = '';

  // Lista con modulos donde se puede hacer busquedas
  opcionesBusqueda: ContextoBusqueda[] = [
    {
      id: 'productos',
      nombre: '📦 Productos',
      ruta: 'productos',
      placeholder: 'Ej: nombre, marca, categoría'
    },
    {
      id: 'clientes',
      nombre: '👥 Clientes',
      ruta: 'clientes',
      placeholder: 'Ej: Juan Pérez, RFC, 555-1234...'
    },
    {
      id: 'ventas',
      nombre: '💰 Ventas',
      ruta: '/ventas',
      placeholder: 'Ej: Folio V-0012, Fecha...'
    }
  ];
  // Por defecto la búsqueda está en "Productos"
  contextoSeleccionado: ContextoBusqueda = this.opcionesBusqueda[0];

  constructor(private router: Router){}

  ngOnInit(): void {
    this.actualizarFecha();
  }

  private actualizarFecha(): void {
    this.fechaActual = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }

  ejecutarBusqueda(): void {
    if (this.terminoBusqueda?.trim()) {
      const ruta = this.contextoSeleccionado.ruta.startsWith('/')
        ? this.contextoSeleccionado.ruta
        : `/admin/${this.contextoSeleccionado.ruta}`;

      this.router.navigate([ruta], {
        queryParams: { q: this.terminoBusqueda }
      });

      // Opcional: Limpiar la barra después de buscar
      // this.terminoBusqueda = '';
    }
  }

  limpiarBusqueda() {
    this.terminoBusqueda='';

    const ruta = this.contextoSeleccionado.ruta.startsWith('/')
      ? this.contextoSeleccionado.ruta
      : `/admin/${this.contextoSeleccionado.ruta}`;

    this.router.navigate([ruta]);
  }

}
