import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoMercancia } from './historico-mercancia';

describe('HistoricoMercancia', () => {
  let component: HistoricoMercancia;
  let fixture: ComponentFixture<HistoricoMercancia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoMercancia],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoMercancia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
