import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Devoluciones } from './devoluciones';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionesService } from '../../../services/autostore.devoluciones-service';

describe('Devoluciones', () => {
  let component: Devoluciones;
  let fixture: ComponentFixture<Devoluciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Devoluciones],
      providers: [
        {
          provide: SaleService,
          useValue: {
            obtenerVentas: () => of([]),
          },
        },
        {
          provide: DevolucionesService,
          useValue: {
            listar: () => of([]),
            crear: () => of({ id: 1 } as any),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Devoluciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and initialize empty collections', () => {
    expect(component).toBeTruthy();
    expect(component.ventas).toEqual([]);
    expect(component.devoluciones).toEqual([]);
  });
});
