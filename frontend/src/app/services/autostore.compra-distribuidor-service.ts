// compra.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
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

  filtrarCompras(inicio?: string, fin?: string, distribuidorId?: number): Observable<Compra[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    if (distribuidorId) params = params.set('distribuidorId', distribuidorId);

    return this.http.get<Compra[]>(`${this.apiURL}/filtrar`, { params });
  }

  buscarPorId(id: number): Observable<Compra> {
    console.log('📡 Petición GET a:', `${this.apiURL}/${id}`);
    return this.http.get<Compra>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Compras-Distribuidor-Service:', response.distribuidor);
      })
    );
  }
}
