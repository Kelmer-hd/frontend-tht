import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UnidadMedida, UnidadMedidaCreate } from '../interface/unidad-medida.interface';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  private readonly apiUrl = `${environment.apiUrl}/unidadesmedias`;

  constructor(private http: HttpClient) {}

  // Corregido: tu backend no devuelve una respuesta paginada, solo una lista
  getUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUnidadMedidaById(id: number): Observable<UnidadMedida> {
    return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createUnidadMedida(unidadMedida: UnidadMedidaCreate): Observable<UnidadMedida> {
    return this.http.post<UnidadMedida>(this.apiUrl, unidadMedida)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUnidadMedida(id: number, unidadMedida: UnidadMedidaCreate): Observable<UnidadMedida> {
    return this.http.put<UnidadMedida>(`${this.apiUrl}/${id}`, unidadMedida)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteUnidadMedida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      errorMessage = `Código: ${error.status}\nMensaje: ${error.error?.message || error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}