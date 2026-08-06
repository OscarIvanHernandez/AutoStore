import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProductoInterface, AjusteRequestInterface, EstadoProductoInterface } from './autostore.models';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // URL base de la API para productos
  private apiURL = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient){}

  // GET /api/productos
  getProductos(): Observable<ProductoInterface[]> {
  console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<ProductoInterface[]>(this.apiURL).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // GET /api/productos/activos
  getProductosActivos(): Observable<ProductoInterface[]> {
  console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<ProductoInterface[]>(`${this.apiURL}/activos`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // GET /api/productos/{id}
  getProductoById(id: number): Observable<ProductoInterface>{
    console.log('📡 Petición GET a:', `${this.apiURL}/${id}`);
    return this.http.get<ProductoInterface>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // GET /api/productos/search?q=..
  buscar(filtros: {q?: string; marca?: string; categoria?: string; estado?: string}): Observable<ProductoInterface[]> {
    let params = new HttpParams();
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.marca) {
      params = params.set('marca', filtros.marca)
    }
    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    if (filtros.estado?.trim()) {
      params = params.set('estado', filtros.estado.trim());
    }
    console.log('📡 Petición GET a:', `${this.apiURL}/search`, { params });
    return this.http.get<ProductoInterface[]>(`${this.apiURL}/search`, { params }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // POST /api/productos
  crear(producto: ProductoInterface): Observable<ProductoInterface>{
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<ProductoInterface>(this.apiURL, producto).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // PUT /api/productos/{id}
  actualizar(id: number, producto: ProductoInterface): Observable<ProductoInterface>{
    console.log('📡 Petición PUT a:', `${this.apiURL}/${id}/editar`);
    return this.http.put<ProductoInterface>(`${this.apiURL}/${id}/editar`, producto).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // PATCH /api/productos/{id}/estado
  actualizarEstado(estado: EstadoProductoInterface): Observable<ProductoInterface> {
    const nuevoEstado = estado.activo ?? true;
    console.log('📡 Petición PATCH a:', `${this.apiURL}/${estado.id}/estado`, { nuevoEstado });
    return this.http.patch<ProductoInterface>(`${this.apiURL}/${estado.id}/estado`, nuevoEstado).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // DELETE /api/productos/{id}
  eliminar(id: number): Observable<void> {
    console.log('📡 Petición POST a:', `${this.apiURL}/${id}`);
    return this.http.delete<void>( `${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // POST /api/productos/{id}/ajustar-stock (ISSUE-07)
  ajustarStock(id: number, ajuste: AjusteRequestInterface): Observable<ProductoInterface> {
    return this.http.post<ProductoInterface>(`${this.apiURL}/${id}/ajustar-stock`, ajuste);
  }
}
