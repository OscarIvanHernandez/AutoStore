import { ChangeDetectorRef, Directive } from '@angular/core';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';

@Directive()
export abstract class BaseComponent {
  isLoading: boolean = true;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  initialLoadError: string | null = null;
  hasLoadedData = false;

  constructor(protected cdr: ChangeDetectorRef) {}

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

  protected registrarErrorCarga(error: { status?: number }, accion: string): void {
    const message = this.mensajeError(error, accion);
    if (this.hasLoadedData) {
      this.showErrorMessage(message);
    } else {
      this.initialLoadError = message;
    }
  }

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

  private mensajeError(error: { status?: number }, accion: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    return `Ocurrió un error al ${accion}. (${error.status ?? 'desconocido'})`;
  }
}
