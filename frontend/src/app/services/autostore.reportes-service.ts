import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteGanancias, TopProducto } from './autostore.models';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  obtenerGanancias(desde: string, hasta: string): Observable<ReporteGanancias> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ReporteGanancias>(`${this.apiUrl}/ganancias`, { params });
  }

  obtenerTopProductos(desde: string, hasta: string, limite: number = 10): Observable<TopProducto[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limite', limite.toString());

    return this.http.get<TopProducto[]>(`${this.apiUrl}/top-productos`, { params });
  }

  descargarCsvGanancias(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/ganancias/csv`, {
      params,
      responseType: 'blob'
    });
  }
}
