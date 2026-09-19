import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorteDetalleTicket } from './corte-detalle-ticket';

describe('CorteCaja', () => {
  let component: CorteDetalleTicket;
  let fixture: ComponentFixture<CorteDetalleTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorteDetalleTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(CorteDetalleTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
