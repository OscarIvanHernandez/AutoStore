import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { tap, map, mergeMap } from 'rxjs/operators';
import { Producto, AjusteRequest } from './autostore.models';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // URL base de la API para productos
  private apiURL = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient){}


  // GET /api/productos
  getProductosActivos(): Observable<Producto[]> {
  console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Producto[]>(this.apiURL).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // GET /api/productos/{id}
  getProductoById(id: number): Observable<Producto>{
    console.log('📡 Petición GET a:', `${this.apiURL}/${id}`);
    return this.http.get<Producto>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // GET /api/productos/search?q=..
  buscar(query: string): Observable<Producto[]>{
    console.log('📡 Petición GET a:', `${this.apiURL}/search`, { params: { q:query } });
    return this.http.get<Producto[]>(`${this.apiURL}/search`, { params: { q: query } }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // POST /api/productos
  crear(producto: Producto): Observable<Producto>{
    console.log('📡 Petición PUT a:', this.apiURL);
    return this.http.put<Producto>(this.apiURL, producto).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Prodcutos-Service:', response);
      })
    );
  }

  // PUT /api/productos/{id}
  actualizar(producto: Producto): Observable<Producto>{
    console.log('📡 Petición POST a:', `${this.apiURL}/${producto.id}`);
    return this.http.post<Producto>(`${this.apiURL}/${producto.id}`, producto).pipe(
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
  ajustarStock(id: number, ajuste: AjusteRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiURL}/${id}/ajustar-stock`, ajuste);
  }
}
