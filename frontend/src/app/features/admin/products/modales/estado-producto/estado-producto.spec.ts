import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoProducto } from './estado-producto';

describe('EstadoProducto', () => {
  let component: EstadoProducto;
  let fixture: ComponentFixture<EstadoProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
