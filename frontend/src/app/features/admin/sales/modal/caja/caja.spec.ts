import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Caja } from './caja';

describe('Caja', () => {
  let component: Caja;
  let fixture: ComponentFixture<Caja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Caja],
    }).compileComponents();

    fixture = TestBed.createComponent(Caja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit apertura event with amount', () => {
    spyOn(component.confirmApertura, 'emit');
    component.efectivoInicial = 500;
    component.confirmarApertura();

    expect(component.confirmApertura.emit).toHaveBeenCalledWith(500);
  });

  it('should emit cierre event with amount', () => {
    spyOn(component.confirmCierre, 'emit');
    component.efectivoReal = 650;
    component.confirmarCierre();

    expect(component.confirmCierre.emit).toHaveBeenCalledWith(650);
  });
});
