import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cliente, Abono, DeudoresStats } from './autostore.models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiURL = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  listarClientes(buscar?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (buscar) {
      params = params.set('buscar', buscar);
    }
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Cliente[]>(this.apiURL, { params }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  listarClientesActivos(buscar?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (buscar) {
      params = params.set('buscar', buscar);
    }
    return this.http.get<Cliente[]>(`${this.apiURL}/activos`, { params });
  }

  obtenerCliente(id: number): Observable<Cliente> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Cliente>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  crearCliente(cliente: Partial<Cliente>): Observable<Cliente> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<Cliente>(this.apiURL, cliente).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  actualizarCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    console.log('📡 Petición PUT a:', this.apiURL);
    return this.http.put<Cliente>(`${this.apiURL}/${id}`, cliente).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  eliminarCliente(id: number): Observable<void> {
    console.log('📡 Petición DELETE a:', this.apiURL);
    return this.http.delete<void>(`${this.apiURL}/${id}`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  activarCliente(id: number): Observable<void> {
    console.log('📡 Petición PUT a:', this.apiURL);
    return this.http.put<void>(`${this.apiURL}/${id}/reactivar`, {}).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  // GET /api/productos/search?q=..
  buscar(filtros: {q?: string; telefono?: string; direccion?: string; estado?: string}): Observable<Cliente[]> {
    let params = new HttpParams();
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.telefono) {
      params = params.set('telefono', filtros.telefono)
    }
    if (filtros.direccion) {
      params = params.set('direccion', filtros.direccion);
    }
    if (filtros.estado?.trim()) {
      params = params.set('estado', filtros.estado.trim());
    }
    console.log('📡 Petición GET a:', `${this.apiURL}/search`, { params });
    return this.http.get<Cliente[]>(`${this.apiURL}/search`, { params }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Cliente-Service:', response);
      })
    );
  }

  registrarAbono(clienteId: number, monto: number): Observable<Abono> {
    console.log('📡 Petición POST a:', this.apiURL);
    return this.http.post<Abono>(`${this.apiURL}/${clienteId}/abonos`, { monto }).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  obtenerHistorialAbonos(clienteId: number): Observable<Abono[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Abono[]>(`${this.apiURL}/${clienteId}/abonos`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  obtenerDeudores(): Observable<Cliente[]> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<Cliente[]>(`${this.apiURL}/deudores`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }

  obtenerStatsDeudores(): Observable<DeudoresStats> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<DeudoresStats>(`${this.apiURL}/deudores/stats`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Clientes-Service:', response);
      })
    );
  }
}
