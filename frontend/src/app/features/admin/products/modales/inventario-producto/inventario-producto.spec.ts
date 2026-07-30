import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioProducto } from './inventario-producto';

describe('InventarioProducto', () => {
  let component: InventarioProducto;
  let fixture: ComponentFixture<InventarioProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
