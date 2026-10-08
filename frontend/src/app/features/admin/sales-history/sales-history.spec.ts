import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { SaleService } from '../../../services/autostore.sales-service';
import { VentaInterface } from '../../../services/autostore.models';
import { SalesHistory } from './sales-history';

describe('SalesHistory', () => {
  let component: SalesHistory;
  let fixture: ComponentFixture<SalesHistory>;
  let saleService: Pick<SaleService, 'obtenerVentas' | 'buscar' | 'cancelarVenta'>;
  let queryParams: BehaviorSubject<Record<string, string>>;

  const venta: VentaInterface = {
    id: 12,
    fechaVenta: new Date().toISOString(),
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
      producto: { id: 3, nombre: 'Producto', marca: 'Marca' },
    }],
  };
  const ventaCancelada: VentaInterface = { ...venta, estado: 'CANCELADA' };
  const ventaCredito: VentaInterface = { ...venta, id: 13, tipoVenta: 'CREDITO' };

  beforeEach(async () => {
    queryParams = new BehaviorSubject<Record<string, string>>({});
    saleService = {
      obtenerVentas: vi.fn(() => of([venta])),
      buscar: vi.fn(() => of([ventaCredito])),
      cancelarVenta: vi.fn(() => of(ventaCancelada)),
    };

    await TestBed.configureTestingModule({
      imports: [SalesHistory],
      providers: [
        { provide: SaleService, useValue: saleService },
        { provide: ActivatedRoute, useValue: { queryParams } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesHistory);
    component = fixture.componentInstance;
  });

  it('loads sales and shows a prompt until a sale is selected', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.hasLoadedVentas).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Selecciona una venta');
    expect(fixture.nativeElement.textContent).toContain('#12');
  });

  it('shows a load error and allows retrying', () => {
    vi.mocked(saleService.obtenerVentas)
      .mockReturnValueOnce(throwError(() => ({ status: 500 })))
      .mockReturnValueOnce(of([venta]));

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Error al cargar las ventas. (500)');

    (fixture.nativeElement.querySelector('.text-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.hasLoadedVentas).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('#12');
  });

  it('filters sales by the selected sale type', () => {
    fixture.detectChanges();
    component.filtrarPorTipoVenta('CREDITO');
    fixture.detectChanges();

    expect(saleService.buscar).toHaveBeenCalledWith({ tipoVenta: 'CREDITO' });
    expect(component.tipoVentaSeleccionada).toBe('CREDITO');
    expect(component.ventas).toEqual([ventaCredito]);
  });

  it('uses the navbar query parameter to search sales by folio or name', () => {
    fixture.detectChanges();
    queryParams.next({ q: 'V-0012' });

    expect(saleService.buscar).toHaveBeenLastCalledWith({ q: 'V-0012' });
    expect(component.ventas).toEqual([ventaCredito]);
  });

  it('interprets a navbar query for a sale type as an exact type filter', () => {
    fixture.detectChanges();
    queryParams.next({ q: 'crédito' });

    expect(saleService.buscar).toHaveBeenLastCalledWith({ tipoVenta: 'CREDITO' });
    expect(component.tipoVentaSeleccionada).toBe('CREDITO');
  });

  it('updates the selected sale when cancellation succeeds', () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    fixture.detectChanges();
    component.verDetallesVenta(venta);
    component.cancelarVenta(venta);
    fixture.detectChanges();

    expect(saleService.cancelarVenta).toHaveBeenCalledWith(venta.id);
    expect(component.ventaSeleccionada?.estado).toBe('CANCELADA');
    expect(component.ventas[0].estado).toBe('CANCELADA');
    expect(fixture.nativeElement.textContent).toContain('Venta cancelada correctamente');

    vi.unstubAllGlobals();
  });

  it('does not enable cancellation for sales outside the current local date', () => {
    const fechaAyer = new Date();
    fechaAyer.setDate(fechaAyer.getDate() - 1);

    expect(component.esVentaDeHoy(fechaAyer.toISOString())).toBe(false);
    expect(component.esVentaDeHoy('fecha-invalida')).toBe(false);
  });
});
