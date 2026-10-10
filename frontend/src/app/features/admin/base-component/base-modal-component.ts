import { ChangeDetectorRef, Directive } from '@angular/core';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';

@Directive()
export abstract class BaseModalComponent {
  mostrarAyuda: boolean = false;

  constructor() {};

  // --- Manejo de Guía de ayuda en modales
  alternarAyuda() {
    this.mostrarAyuda = !this.mostrarAyuda;
  }
};
