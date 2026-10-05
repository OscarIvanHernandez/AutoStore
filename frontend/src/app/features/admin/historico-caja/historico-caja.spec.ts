import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CajaService } from '../../../services/autostore.caja-service';
import { CorteCaja } from '../../../services/autostore.models';
import { HistoricoCaja } from './historico-caja';

describe('HistoricoCaja', () => {
  let component: HistoricoCaja;
  let fixture: ComponentFixture<HistoricoCaja>;
  let cajaService: Pick<CajaService, 'obtenerHistorialCaja' | 'buscarHistorialPorFechas'>;

  const corte: CorteCaja = {
    id: 12,
    fechaApertura: '2026-10-01T08:00:00',
    fechaCierre: '2026-10-01T17:00:00',
    efectivoInicial: 500,
    efectivoEsperado: 1500,
    efectivoReal: 1490,
    diferencia: -10,
    activo: false,
  };

  beforeEach(async () => {
    cajaService = {
      obtenerHistorialCaja: vi.fn(() => of([])),
      buscarHistorialPorFechas: vi.fn(() => of([])),
    };

    await TestBed.configureTestingModule({
      imports: [HistoricoCaja],
      providers: [
        provideRouter([]),
        { provide: CajaService, useValue: cajaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoCaja);
    component = fixture.componentInstance;
  });

  it('loads and shows the empty state when there are no cash cuts', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('No hay cortes de caja registrados.');
    expect(cajaService.obtenerHistorialCaja).toHaveBeenCalledOnce();
  });

  it('shows the initial load error and allows retrying', () => {
    vi.mocked(cajaService.obtenerHistorialCaja)
      .mockReturnValueOnce(throwError(() => ({ status: 500 })))
      .mockReturnValueOnce(of([corte]));

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Error al cargar el historial de caja. (500)');

    (fixture.nativeElement.querySelector('.text-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.hasLoadedHistorico).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('#12');
  });

  it('shows filtered results and can restore the loaded history without another request', () => {
    vi.mocked(cajaService.obtenerHistorialCaja).mockReturnValue(of([corte]));
    fixture.detectChanges();

    vi.mocked(cajaService.buscarHistorialPorFechas).mockReturnValue(of([corte]));
    component.fechaInicio = '2026-10-01';
    component.fechaFin = '2026-10-02';
    component.filtrarPorFechas();
    fixture.detectChanges();

    expect(component.cortesMostrados).toEqual([corte]);
    expect(fixture.nativeElement.textContent).toContain('#12');

    component.limpiarFiltros();
    fixture.detectChanges();

    expect(component.filtroAplicado).toBe(false);
    expect(component.cortesMostrados).toEqual([corte]);
    expect(cajaService.obtenerHistorialCaja).toHaveBeenCalledOnce();
  });

  it('does not send an invalid date range to the service', () => {
    fixture.detectChanges();
    component.fechaInicio = '2026-10-02';
    component.fechaFin = '2026-10-01';
    component.filtrarPorFechas();
    fixture.detectChanges();

    expect(component.filterValidationError).toContain('no puede ser posterior');
    expect(cajaService.buscarHistorialPorFechas).not.toHaveBeenCalled();
  });
});
