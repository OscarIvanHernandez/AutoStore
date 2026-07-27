/**
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoProductoInterface } from '../../../../../services/autostore.models';

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

  it('should emit a minimal state payload with the active state updated', () => {
    component.productoEstado = {
      id: 7,
      nombre: 'Teclado',
      activo: false,
    };

    component.ngOnChanges({
      productoEstado: {
        currentValue: component.productoEstado,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    component.productoNuevoEstado!.activo = true;

    //const updateSpy = jasmine.createSpy('updateSpy');
    //component.update.subscribe(updateSpy);

    component.guardarCambios();

    expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 7,
      nombre: 'Teclado',
      marca: 'Logitech',
      activo: true,
    }));
  });
});
**/
