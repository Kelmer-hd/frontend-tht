// src/app/services/almacen-tela.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlmacenTela } from '../interface/almacen-tela.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlmacenTelaService {
  private apiUrl = `${environment.apiUrl}/almacen-telas`;
  
  constructor(private http: HttpClient) { }
  
  /**
   * Obtiene todas las telas asignadas a almacenes
   */
  getAll(): Observable<AlmacenTela[]> {
    return this.http.get<AlmacenTela[]>(this.apiUrl);
  }
  
  /**
   * Obtiene las telas asignadas a un almacén específico
   * @param almacenId ID del almacén
   */
  getTelasDeAlmacen(almacenId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/almacen-telas/almacen/${almacenId}`);
  }
  
  /**
   * Asigna una tela a un almacén
   */
  asignarTelaAAlmacen(almacenId: number, telaId: number, peso: number): Observable<AlmacenTela> {
    const body = {
      almacenId,
      telaId,
      peso, // Cambiado de cantidad a peso
    };
    return this.http.post<AlmacenTela>(`${this.apiUrl}/asignar`, body);
  }
  
  /**
   * Actualiza el peso de una tela en un almacén
   */
  actualizarPeso(almacenId: number, telaId: number, peso: number): Observable<AlmacenTela> {
    const body = {
      almacenId,
      telaId,
      peso // Cambiado de cantidad a peso
    };
    return this.http.patch<AlmacenTela>(`${this.apiUrl}/actualizar-peso`, body); // Cambiado el endpoint
  }
  
  /**
   * Transfiere tela de un almacén a otro
   */
  transferirTela(almacenOrigenId: number, almacenDestinoId: number, telaId: number, peso: number): Observable<void> {
    const body = {
      almacenOrigenId,
      almacenDestinoId,
      telaId,
      peso // Cambiado de cantidad a peso
    };
    return this.http.post<void>(`${this.apiUrl}/transferir`, body);
  }
}