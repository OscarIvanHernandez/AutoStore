import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCaja } from './historial-caja';

describe('HistorialCaja', () => {
  let component: HistorialCaja;
  let fixture: ComponentFixture<HistorialCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCaja],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialCaja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
