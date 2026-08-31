import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoCaja } from './autostore.models';

@Injectable({
  providedIn: 'root',
})
export class CajaService {
  private apiURL = 'http://localhost:8080/api/caja';

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<EstadoCaja> {
    return this.http.get<EstadoCaja>(`${this.apiURL}/estado-actual`);
  }

  abrirCaja(efectivoInicial: number): Observable<any> {
    return this.http.post(`${this.apiURL}/apertura`, { efectivoInicial });
  }

  cerrarCaja(efectivoReal: number): Observable<any> {
    return this.http.post(`${this.apiURL}/cierre`, { efectivoReal });
  }
}
