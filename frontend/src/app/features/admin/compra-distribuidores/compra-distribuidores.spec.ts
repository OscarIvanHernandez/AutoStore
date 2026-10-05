import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { ProductoService } from '../../../services/autostore.product-service';
import { Compra, Distribuidor, ProductoInterface } from '../../../services/autostore.models';
import { CompraDistribuidores } from './compra-distribuidores';

describe('CompraDistribuidores', () => {
  let component: CompraDistribuidores;
  let fixture: ComponentFixture<CompraDistribuidores>;
  let distribuidorService: Pick<DistribuidorService, 'listar'>;
  let productoService: Pick<ProductoService, 'getProductos'>;
  let compraService: Pick<CompraDistribuidorService, 'registrarCompra'>;

  const distribuidor: Distribuidor = {
    id: 7,
    nombre: 'Distribuidor Norte',
    telefono: '8331234567',
    activo: true,
  };

  const producto: ProductoInterface = {
    id: 15,
    nombre: 'Filtro',
    marca: 'AutoStore',
    categoria: 'Motor',
    precioCompra: 50,
    precioVentaMostrador: 80,
    stockActual: 4,
    stockMinimo: 2,
    activo: true,
  };

  const compra: Compra = {
    id: 101,
    distribuidor,
    fecha: '2026-10-05T12:00:00',
    total: 100,
    detalles: [],
  };

  beforeEach(async () => {
    distribuidorService = {
      listar: vi.fn(() => of([distribuidor])),
    };
    productoService = {
      getProductos: vi.fn(() => of([producto])),
    };
    compraService = {
      registrarCompra: vi.fn(() => of(compra)),
    };

    await TestBed.configureTestingModule({
      imports: [CompraDistribuidores],
      providers: [
        { provide: DistribuidorService, useValue: distribuidorService },
        { provide: ProductoService, useValue: productoService },
        { provide: CompraDistribuidorService, useValue: compraService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraDistribuidores);
    component = fixture.componentInstance;
  });

  it('loads active distributors and products independently', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.hasLoadedDistribuidores).toBe(true);
    expect(component.hasLoadedProductos).toBe(true);
    expect(component.distribuidores).toEqual([distribuidor]);
    expect(component.productos).toEqual([producto]);
  });

  it('keeps product loading errors separate and allows retrying', () => {
    vi.mocked(productoService.getProductos)
      .mockReturnValueOnce(throwError(() => ({ status: 503 })))
      .mockReturnValueOnce(of([producto]));
    fixture.detectChanges();

    expect(component.hasLoadedDistribuidores).toBe(true);
    expect(component.hasLoadedProductos).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Error al cargar los productos. (503)');

    const retry = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find((button) => button.textContent.includes('Reintentar carga')) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();

    expect(component.hasLoadedProductos).toBe(true);
    expect(component.productos).toEqual([producto]);
  });

  it('rejects an invalid quantity before adding a line item', () => {
    fixture.detectChanges();
    component.productoSeleccionado = producto;
    component.cantidad = 1.5;
    component.precioUnitarioCompra = 50;
    component.agregarProducto();

    expect(component.items).toHaveLength(0);
    expect(component.errorMessage).toContain('número entero');
  });

  it('registers the purchase, clears the cart and reloads inventory', () => {
    fixture.detectChanges();
    component.distribuidorSeleccionadoId = distribuidor.id;
    component.folio = ' F-102 ';
    component.productoSeleccionado = producto;
    component.cantidad = 2;
    component.precioUnitarioCompra = 50;
    component.agregarProducto();

    component.guardarCompra();
    fixture.detectChanges();

    expect(compraService.registrarCompra).toHaveBeenCalledWith({
      distribuidorId: distribuidor.id,
      folio: 'F-102',
      productos: [{ productoId: producto.id, cantidad: 2, precioUnitarioCompra: 50 }],
    });
    expect(component.items).toHaveLength(0);
    expect(component.totalCompra).toBe(0);
    expect(productoService.getProductos).toHaveBeenCalledTimes(2);
  });

  it('does not clear the cart when purchase registration fails', () => {
    vi.mocked(compraService.registrarCompra).mockReturnValue(throwError(() => ({ status: 500 })));
    fixture.detectChanges();
    component.distribuidorSeleccionadoId = distribuidor.id;
    component.productoSeleccionado = producto;
    component.cantidad = 1;
    component.precioUnitarioCompra = 50;
    component.agregarProducto();

    component.guardarCompra();

    expect(component.items).toHaveLength(1);
    expect(component.errorMessage).toContain('500');
  });
});
