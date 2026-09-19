import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleTicket } from './sale-ticket';

describe('SaleTicket', () => {
  let component: SaleTicket;
  let fixture: ComponentFixture<SaleTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleTicket]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SaleTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the change from the effective cash received', () => {
    component.venta = { id: 15, total: 320, tipoVenta: 'CONTADO' };
    component.efectivoRecibido = 500;

    expect(component.cambio).toBe(180);
  });
});
