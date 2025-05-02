import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SalidaCorte,
  SalidaCorteDTO,
  SalidaCorteFiltro,
  AnularDTO,
  ConsumoRealDTO
} from '../interface/salida-corte.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalidaCorteService {
  private apiUrl = `${environment.apiUrl}/salidas-tela`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Registra una nueva salida de tela
   */
  registrarSalida(dto: SalidaCorteDTO): Observable<SalidaCorte> {
    return this.http.post<SalidaCorte>(this.apiUrl, dto);
  }
  
  /**
   * Anula una salida de tela existente
   */
  anularSalida(id: number, dto: AnularDTO): Observable<SalidaCorte> {
    return this.http.put<SalidaCorte>(
      `${this.apiUrl}/${id}/anular`,
      null,
      { params: { motivo: dto.motivo, usuario: dto.usuario } }
    );
  }
  
  /**
   * Registra el consumo real de una salida (puede ser menor a la cantidad enviada)
   */
  registrarConsumoReal(id: number, dto: ConsumoRealDTO): Observable<SalidaCorte> {
    let params = new HttpParams()
      .set('consumoReal', dto.consumoReal.toString())
      .set('usuario', dto.usuario);
   
    if (dto.observacion) {
      params = params.set('observacion', dto.observacion);
    }
    
    return this.http.put<SalidaCorte>(`${this.apiUrl}/${id}/consumo-real`, null, { params });
  }
  
  /**
   * Obtiene una salida por su ID
   */
  obtenerSalida(id: number): Observable<SalidaCorte> {
    return this.http.get<SalidaCorte>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Busca salidas por diferentes criterios
   */
  buscarSalidas(filtro: SalidaCorteFiltro = {}, page: number = 0, size: number = 10): Observable<{ content: SalidaCorte[], totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
   
    if (filtro.op) params = params.set('op', filtro.op);
    if (filtro.areaDestino) params = params.set('areaDestino', filtro.areaDestino);
    if (filtro.fechaInicio) params = params.set('fechaInicio', filtro.fechaInicio);
    if (filtro.fechaFin) params = params.set('fechaFin', filtro.fechaFin);
   
    return this.http.get<{ content: SalidaCorte[], totalElements: number }>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene las salidas por tela ID
   */
  obtenerSalidasPorTela(telaId: number): Observable<SalidaCorte[]> {
    return this.http.get<SalidaCorte[]>(`${this.apiUrl}/tela/${telaId}`);
  }
}