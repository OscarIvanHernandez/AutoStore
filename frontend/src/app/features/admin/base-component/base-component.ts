import { ChangeDetectorRef, Directive } from '@angular/core';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';

@Directive()
export abstract class BaseComponent {
  isLoading: boolean = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Diccionario genérico para errores de carga iniciales o específicos por recurso
  loadErrors: Record<string, string | null> = {};

  // Estado global de carga por recurso (ej: loadingStates['productos'] = true)
  loadingStates: Record<string, boolean> = {};

  constructor(protected cdr: ChangeDetectorRef) {}

  // --- Manejo de Errores por Recurso/Módulo ---

  setResourceError(recurso: string, message: string): void {
    this.loadErrors[recurso] = message;
    this.cdr.detectChanges();
  }

  clearResourceError(recurso: string): void {
    this.loadErrors[recurso] = null;
    this.cdr.detectChanges();
  }

  hasResourceError(recurso: string): boolean {
    return !!this.loadErrors[recurso];
  }

  getResourceError(recurso: string): string | null {
    return this.loadErrors[recurso] || null;
  }

  showErrorMessage(message: string, duration = 3500): void {
    this.errorMessage = message;
    this.successMessage = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  showSuccessMessage(message: string, duration = 3500): void {
    this.successMessage = message;
    this.errorMessage = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  /*protected registrarErrorCarga(error: { status?: number }, accion: string): void {
    const message = this.mensajeError(error, accion);
    if (this.hasLoadedData) {
      this.showErrorMessage(message);
    } else {
      this.initialLoadError = message;
    }
  }*/

  // --- Helper genérico para peticiones de carga (GET) ---

  cargarRecurso<T>(
    recurso: string,
    request: Observable<T>,
    onSuccess: (data: T) => void,
    nombreRecurso = recurso
  ): void {
    this.loadingStates[recurso] = true;
    this.clearResourceError(recurso);

    request.pipe(
      catchError((error) => {
        const msg = error.status === 0
          ? 'No se pudo conectar con el servidor.'
          : `Error al cargar ${nombreRecurso}. (${error.status ?? 'desconocido'})`;

        this.setResourceError(recurso, msg);
        return EMPTY;
      }),
      finalize(() => {
        this.loadingStates[recurso] = false;
        this.cdr.detectChanges();
      })
    ).subscribe(onSuccess);
  }

  // --- Helper genérico para mutaciones (POST, PUT, DELETE) ---
  protected ejecutarMutacion<T>(
    request: Observable<T>,
    accion: string,
    onSuccess: (data: T) => void
  ): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.isSaving = true;

    request.pipe(
      catchError((error) => {
        this.showErrorMessage(this.mensajeError(error, accion));
        return EMPTY;
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe(onSuccess);
  }

  protected mensajeError(error: { status?: number }, accion: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    return `Ocurrió un error al ${accion}. (${error.status ?? 'desconocido'})`;
  }
}
