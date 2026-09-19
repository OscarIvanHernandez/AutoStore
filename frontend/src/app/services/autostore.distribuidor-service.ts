// distribuidor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Distribuidor } from './autostore.models';


@Injectable({ providedIn: 'root' })
export class DistribuidorService {
  private apiURL = 'http://localhost:8080/api/distribuidores';

  constructor(private http: HttpClient) {}

  listar(): Observable<Distribuidor[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Distribuidor[]>(this.apiURL).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Distribuidor-Service:', response);
      })
    );
  }

  crear(distribuidor: Partial<Distribuidor>): Observable<Distribuidor> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<Distribuidor>(this.apiURL, distribuidor).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Distribuidor-Service:', response.nombre);
      })
    );
  }

  actualizar(id: number, distribuidor: Partial<Distribuidor>): Observable<Distribuidor> {
    console.log('📡 Petición PUT a:', this.apiURL);
    return this.http.put<Distribuidor>(`${this.apiURL}/${id}`, distribuidor).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Distribuidor-Service:', response);
      })
    );
  }

  desactivar(id: number): Observable<void> {
    console.log('📡 Petición DELETE a:', this.apiURL);
    return this.http.delete<void>(`${this.apiURL}/desactivar/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Distribuidor-Service:', response);
      })
    );
  }

  activar(id: number): Observable<void> {
    console.log('📡 Petición PUT a:', this.apiURL);
    return this.http.put<void>(`${this.apiURL}/activar/${id}`, {}).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Distribuidor-Service:', response);
      })
    );
  }
}
