// compra.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Compra, CompraRequest } from './autostore.models';


@Injectable({ providedIn: 'root' })
export class CompraDistribuidorService {
  private apiURL = 'http://localhost:8080/api/compras';

  constructor(private http: HttpClient) {}

  registrarCompra(request: CompraRequest): Observable<Compra> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<Compra>(this.apiURL, request).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Compras-Distribuidor-Service:', response.detalles);
      })
    );
  }

  listarCompras(): Observable<Compra[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Compra[]>(this.apiURL).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Compras-Distribuidor-Service: compras:', response.length);
      })
    );
  }

  obtenerPorId(id: number): Observable<Compra> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Compra>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Compras-Distribuidor-Service:', response.distribuidor);
      })
    );
  }
}
