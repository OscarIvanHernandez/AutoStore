import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { EstadoCaja } from './autostore.models';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class CajaService {
  private apiURL = 'http://localhost:8080/api/caja';

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<EstadoCaja> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<EstadoCaja>(`${this.apiURL}/estado-actual`).pipe(
      tap(responde => {
        console.log('📊 Respuesta recibida en AutoStore/');
      })
    );
  }

  abrirCaja(efectivoInicial: number): Observable<any> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post(`${this.apiURL}/apertura`, { efectivoInicial }).pipe(
      tap(responde => {
        console.log('📊 Respuesta recibida en AutoStore/');
      })
    );
  }

  cerrarCaja(efectivoReal: number): Observable<any> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post(`${this.apiURL}/cierre`, { efectivoReal }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/');
      })
    );
  }
}
