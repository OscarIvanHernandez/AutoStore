import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Sales } from './sales';
import { SaleService } from '../../../services/autostore.sales-service';

describe('Sales', () => {
  let component: Sales;
  let fixture: ComponentFixture<Sales>;
  let ventaService: jasmine.SpyObj<SaleService>;

  beforeEach(async () => {
    ventaService = jasmine.createSpyObj('SaleService', ['crearVenta']);
    ventaService.crearVenta.and.returnValue(of({ id: 12, total: 450 }));

    await TestBed.configureTestingModule({
      imports: [Sales],
      providers: [
        { provide: SaleService, useValue: ventaService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sales);
    component = fixture.componentInstance;
    component.carrito = [
      {
        productoId: 1,
        nombre: 'Producto prueba',
        cantidad: 2,
        precioTipo: 'MOSTRADOR',
        precioUnitario: 250,
        subTotal: 500,
        stockMaximo: 10,
      }
    ];
    component.descuento = 0;
    component.totalFinal = 500;
    component.efectivoRecibido = 700;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include efectivoRecibido in the payload when confirming sale', () => {
    component.confirmarVenta();

    expect(ventaService.crearVenta).toHaveBeenCalledWith(
      jasmine.objectContaining({
        efectivoRecibido: 700,
        tipoVenta: 'CONTADO',
      })
    );
  });
});
