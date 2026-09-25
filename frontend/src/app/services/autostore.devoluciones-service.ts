import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Devoluciones } from './autostore.models';

@Injectable({providedIn: 'root'})
export class DevolucionesService {
  private apiURL = 'http://localhost:8080/api/devoluciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<Devoluciones[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Devoluciones[]>(this.apiURL).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Devoluciones-Service:', response);
      })
    );
  }

  crear(devolucion: Devoluciones): Observable<Devoluciones> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<Devoluciones>(this.apiURL, devolucion).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Devoluciones-Service:', response);
      })
    );
  }

  obtenrId(id: number): Observable<Devoluciones> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Devoluciones>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Devoluciones-Service:', response.id);
      })
    );
  }
}
