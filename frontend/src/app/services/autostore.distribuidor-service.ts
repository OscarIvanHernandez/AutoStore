// distribuidor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Distribuidor } from './autostore.models';


@Injectable({ providedIn: 'root' })
export class DistribuidorService {
  private apiUrl = 'http://localhost:8080/api/distribuidores';

  constructor(private http: HttpClient) {}

  listar(): Observable<Distribuidor[]> {
    return this.http.get<Distribuidor[]>(this.apiUrl);
  }

  crear(distribuidor: Partial<Distribuidor>): Observable<Distribuidor> {
    return this.http.post<Distribuidor>(this.apiUrl, distribuidor);
  }

  actualizar(id: number, distribuidor: Partial<Distribuidor>): Observable<Distribuidor> {
    return this.http.put<Distribuidor>(`${this.apiUrl}/${id}`, distribuidor);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/desactivar/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/activar/${id}`, {});
  }
}
