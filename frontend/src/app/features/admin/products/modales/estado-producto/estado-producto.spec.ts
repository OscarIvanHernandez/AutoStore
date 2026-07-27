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

  it('should emit a product payload with the active state updated', () => {
    component.producto = {
      id: 7,
      nombre: 'Teclado',
      marca: 'Logitech',
      categoria: 'Periféricos',
      precioCompra: 50,
      precioVentaMostrador: 100,
      stockActual: 10,
      stockMinimo: 3,
      activo: false,
    };

    component.ngOnChanges();
    component.productoNuevoEstado!.activo = true;

    const updateSpy = jasmine.createSpy('updateSpy');
    component.update.subscribe(updateSpy);

    component.guardarCambios();

    expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 7,
      nombre: 'Teclado',
      marca: 'Logitech',
      activo: true,
    }));
  });
});
