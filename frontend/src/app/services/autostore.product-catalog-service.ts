import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogoProductoInterface } from './autostore.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogoProductoService {
  private readonly marcasUrl = 'http://localhost:8080/api/marcas';
  private readonly categoriasUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  obtenerMarcas(soloActivas = false): Observable<CatalogoProductoInterface[]> {
    return this.http.get<CatalogoProductoInterface[]>(this.marcasUrl, {
      params: { soloActivas }
    });
  }

  obtenerCategorias(soloActivas = false): Observable<CatalogoProductoInterface[]> {
    return this.http.get<CatalogoProductoInterface[]>(this.categoriasUrl, {
      params: { soloActivas }
    });
  }

  crearMarca(marca: CatalogoProductoInterface): Observable<CatalogoProductoInterface> {
    return this.http.post<CatalogoProductoInterface>(this.marcasUrl, marca);
  }

  actualizarMarca(marca: CatalogoProductoInterface): Observable<CatalogoProductoInterface> {
    return this.http.put<CatalogoProductoInterface>(`${this.marcasUrl}/${marca.id}`, marca);
  }

  desactivarMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.marcasUrl}/${id}`);
  }

  crearCategoria(categoria: CatalogoProductoInterface): Observable<CatalogoProductoInterface> {
    return this.http.post<CatalogoProductoInterface>(this.categoriasUrl, categoria);
  }

  actualizarCategoria(categoria: CatalogoProductoInterface): Observable<CatalogoProductoInterface> {
    return this.http.put<CatalogoProductoInterface>(`${this.categoriasUrl}/${categoria.id}`, categoria);
  }

  desactivarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriasUrl}/${id}`);
  }
}
