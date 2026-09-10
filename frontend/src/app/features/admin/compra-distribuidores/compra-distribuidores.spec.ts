import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraDistribuidores } from './compra-distribuidores';

describe('CompraDistribuidores', () => {
  let component: CompraDistribuidores;
  let fixture: ComponentFixture<CompraDistribuidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraDistribuidores],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraDistribuidores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
