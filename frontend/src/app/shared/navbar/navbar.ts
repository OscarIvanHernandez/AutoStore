import { Component } from '@angular/core';
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
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  terminoBusqueda: string | null = null;

  // Lista con modulos donde se puede hacer busquedas
  opcionesBusqueda: ContextoBusqueda[] = [
    {
      id: 'productos',
      nombre: '📦 Productos',
      ruta: '/productos',
      placeholder: 'Ej: Motorcraft, Llanta 15, Lubricante...'
    },
    {
      id: 'clientes',
      nombre: '👥 Clientes',
      ruta: '/clientes',
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

  ejecutarBusqueda() {
    if (this.terminoBusqueda?.trim()) {
      // Navegamos a la ruta del contexto seleccionado (ej: /productos?q=llanta)
      this.router.navigate([this.contextoSeleccionado.ruta], {
        queryParams: { q: this.terminoBusqueda }
      });

      // Opcional: Limpiar la barra después de buscar
      // this.terminoBusqueda = '';
    }
  }
}
