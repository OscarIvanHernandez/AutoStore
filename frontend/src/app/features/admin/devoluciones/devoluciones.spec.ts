import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Devoluciones } from './devoluciones';
import { SaleService } from '../../../services/autostore.sales-service';
import { DevolucionesService } from '../../../services/autostore.devoluciones-service';
import { VentaInterface } from '../../../services/autostore.models';
import { throwError } from 'rxjs';

const ventaDisponible: VentaInterface = {
  id: 1,
  fechaVenta: '2026-10-03T12:00:00',
  subtotal: 100,
  descuento: 0,
  total: 100,
  tipoVenta: 'CONTADO',
  estado: 'COMPLETADA',
  metodoPago: 'EFECTIVO',
  detalles: [{
    id: 1,
    cantidad: 1,
    precioUnitario: 100,
    subtotal: 100,
    producto: { id: 10, nombre: 'Producto', marca: 'Marca' },
  }],
};

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
            obtenerVentas: () => of([ventaDisponible]),
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
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads sales independently from the returns history', () => {
    expect(component).toBeTruthy();
    expect(component.ventas).toEqual([ventaDisponible]);
    expect(component.hasLoadedVentas).toBeTrue();
    expect(component.devoluciones).toEqual([]);
  });

  it('keeps sales available and allows retry when the history request fails', () => {
    spyOn(TestBed.inject(DevolucionesService), 'listar').and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.cargarDevoluciones();

    expect(component.ventas).toEqual([ventaDisponible]);
    expect(component.hasLoadedVentas).toBeTrue();
    expect(component.loadingStates['cargarDevoluciones']).toBeFalse();
    expect(component.loadErrors['cargarDevoluciones']).toContain('500');
  });
});
