import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';
import { VentaRequest } from "./autostore.models";

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private apiURL = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient){}

  crearVenta(venta: VentaRequest): Observable<any> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.post<any>(this.apiURL, venta).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Venta-Service:', response);
      })
    );
  }

  obtenerVentasDeHoy(): Observable<any> {
    console.log('📡 Petición GET a:', this.apiURL);
    return this.http.get<any>(`${this.apiURL}/hoy`).pipe(
      tap(response => {
        console.log('📊 Respuesta recibida en AutoStore/   Venta-Service:', response);
      })
    );
  }
}
