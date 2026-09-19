import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { EstadoCaja, CorteCaja } from './autostore.models';
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
        console.log('📊 Respuesta recibida en AutoStore/  estado-actual');
      })
    );
  }

  abrirCaja(efectivoInicial: number): Observable<any> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post(`${this.apiURL}/apertura`, { efectivoInicial }).pipe(
      tap(responde => {
        console.log('📊 Respuesta recibida en AutoStore/  apertura');
      })
    );
  }

  cerrarCaja(efectivoReal: number): Observable<any> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post(`${this.apiURL}/cierre`, { efectivoReal }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/  cierre');
      })
    );
  }

  obtenerHistorialCaja(): Observable<CorteCaja[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<CorteCaja[]>(`${this.apiURL}/historial`).pipe(
      tap(responde => {
        console.log('📊 Respuesta recibida en AutoStore/  historial/');
      })
    );
  }

  buscarHistorialPorFechas(inicio?: string, fin?: string): Observable<CorteCaja[]> {
  let params = new HttpParams();
  if (inicio) params = params.set('inicio', `${inicio}T00:00:00`);
  if (fin) params = params.set('fin', `${fin}T23:59:59`);
    return this.http.get<CorteCaja[]>(`${this.apiURL}/historial/filtrar`, { params }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/  historial/filtrar', response);
      })
    );
  }
}
