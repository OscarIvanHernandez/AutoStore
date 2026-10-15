import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoApiInterface, ProductoInterface } from './autostore.models';
import { ProductoService } from './autostore.product-service';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpTestingController: HttpTestingController;

  const apiProducto: ProductoApiInterface = {
    id: 5,
    nombre: 'Filtro de aceite',
    marca: { id: 11, nombre: 'Bosch', activo: true },
    categoria: { id: 22, nombre: 'Motor', activo: true },
    precioCompra: 100,
    precioVentaMostrador: 150,
    stockActual: 4,
    stockMinimo: 1,
    activo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('normalizes nested brand and category relations for existing product consumers', () => {
    let producto: ProductoInterface | undefined;
    service.getProductoById(5).subscribe(response => producto = response);

    httpTestingController.expectOne('http://localhost:8080/api/productos/5').flush(apiProducto);

    expect(producto).toEqual(expect.objectContaining({
      marca: 'Bosch',
      marcaId: 11,
      categoria: 'Motor',
      categoriaId: 22
    }));
  });

  it('sends relation IDs when creating a product', () => {
    const producto: ProductoInterface = {
      nombre: 'Filtro de aceite',
      marca: 'Bosch',
      marcaId: 11,
      categoria: 'Motor',
      categoriaId: 22,
      precioCompra: 100,
      precioVentaMostrador: 150,
      stockActual: 4,
      stockMinimo: 1
    };

    service.crear(producto).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/productos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(expect.objectContaining({
      marca: { id: 11 },
      categoria: { id: 22 }
    }));
    request.flush(apiProducto);
  });
});
