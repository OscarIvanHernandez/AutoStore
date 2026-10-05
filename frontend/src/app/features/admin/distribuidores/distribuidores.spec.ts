import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { Distribuidor } from '../../../services/autostore.models';
import { Distribuidores } from './distribuidores';

describe('Distribuidores', () => {
  let component: Distribuidores;
  let fixture: ComponentFixture<Distribuidores>;
  let distribuidorService: Pick<
    DistribuidorService,
    'listar' | 'crear' | 'actualizar' | 'activar' | 'desactivar'
  >;

  const distribuidor: Distribuidor = {
    id: 42,
    nombre: 'Refacciones Norte',
    telefono: '8331234567',
    contacto: 'Ana',
    activo: true,
  };

  beforeEach(async () => {
    distribuidorService = {
      listar: vi.fn(() => of([distribuidor])),
      crear: vi.fn(() => of(distribuidor)),
      actualizar: vi.fn(() => of(distribuidor)),
      activar: vi.fn(() => of(void 0)),
      desactivar: vi.fn(() => of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [Distribuidores],
      providers: [{ provide: DistribuidorService, useValue: distribuidorService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Distribuidores);
    component = fixture.componentInstance;
  });

  it('loads and displays distributors', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.hasLoadedDistribuidores).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Refacciones Norte');
  });

  it('shows a load error and allows retrying', () => {
    vi.mocked(distribuidorService.listar)
      .mockReturnValueOnce(throwError(() => ({ status: 503 })))
      .mockReturnValueOnce(of([distribuidor]));

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Error al cargar los distribuidores. (503)');

    (fixture.nativeElement.querySelector('.text-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.hasLoadedDistribuidores).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Refacciones Norte');
  });

  it('shows an empty state when no active distributors are returned', () => {
    vi.mocked(distribuidorService.listar).mockReturnValue(of([{ ...distribuidor, activo: false }]));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay distribuidores activos.');
  });

  it('uses the distributor ID to deactivate and reports its name', () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.mocked(distribuidorService.listar)
      .mockReturnValueOnce(of([distribuidor]))
      .mockReturnValueOnce(of([{ ...distribuidor, activo: false }]));
    fixture.detectChanges();

    component.desactivar(distribuidor.id);
    fixture.detectChanges();

    expect(distribuidorService.desactivar).toHaveBeenCalledWith(distribuidor.id);
    expect(component.distribuidores[0].activo).toBe(false);
    expect(component.successMessage).toContain(distribuidor.nombre);

    vi.unstubAllGlobals();
  });
});
