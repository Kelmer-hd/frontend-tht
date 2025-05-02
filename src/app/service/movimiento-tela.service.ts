import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MovimientoTela,
  MovimientoTelaDTO,
  MovimientoTelaFiltro,
  EstadisticasMovimiento
} from '../interface/movimiento-tela.interface';
import { environment } from '../../environments/environment';
import { AnularDTO } from '../interface/salida-corte.interface';

@Injectable({
  providedIn: 'root'
})
export class MovimientoTelaService {
  private apiUrl = `${environment.apiUrl}/movimientos-tela`;

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo movimiento de tela
   */
  registrarMovimiento(dto: MovimientoTelaDTO): Observable<MovimientoTela> {
    return this.http.post<MovimientoTela>(this.apiUrl, dto);
  }

  /**
   * Anula un movimiento existente
   */
  anularMovimiento(id: number, dto: AnularDTO): Observable<MovimientoTela> {
    return this.http.put<MovimientoTela>(
      `${this.apiUrl}/${id}/anular`,
      null,
      { params: { motivo: dto.motivo, usuario: dto.usuario } }
    );
  }

  /**
   * Obtiene el historial de movimientos de una tela
   */
  obtenerHistorialTela(telaId: number): Observable<MovimientoTela[]> {
    return this.http.get<MovimientoTela[]>(`${this.apiUrl}/tela/${telaId}`);
  }

  /**
   * Obtiene los movimientos asociados a un documento
   */
  obtenerMovimientosPorDocumento(documentoId: string): Observable<MovimientoTela[]> {
    return this.http.get<MovimientoTela[]>(`${this.apiUrl}/documento/${documentoId}`);
  }

  /**
   * Busca movimientos por diferentes criterios
   */
  buscarMovimientos(filtro: MovimientoTelaFiltro = {}, page: number = 0, size: number = 10): Observable<{ content: MovimientoTela[], totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
   
    if (filtro.telaId) params = params.set('telaId', filtro.telaId.toString());
    if (filtro.tipoMovimiento) params = params.set('tipoMovimiento', filtro.tipoMovimiento);
    if (filtro.areaOrigen) params = params.set('areaOrigen', filtro.areaOrigen);
    if (filtro.areaDestino) params = params.set('areaDestino', filtro.areaDestino);
    if (filtro.fechaInicio) params = params.set('fechaInicio', filtro.fechaInicio);
    if (filtro.fechaFin) params = params.set('fechaFin', filtro.fechaFin);
    if (filtro.usuarioResponsable) params = params.set('usuarioResponsable', filtro.usuarioResponsable); // Corregido
    if (filtro.estado) params = params.set('estado', filtro.estado);
   
    return this.http.get<{ content: MovimientoTela[], totalElements: number }>(this.apiUrl, { params });
}

  /**
   * Obtiene un movimiento por su ID
   */
  obtenerMovimiento(id: number): Observable<MovimientoTela> {
    return this.http.get<MovimientoTela>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene estadísticas de movimientos
   */
  obtenerEstadisticas(): Observable<EstadisticasMovimiento> {
    return this.http.get<EstadisticasMovimiento>(`${this.apiUrl}/estadisticas`);
  }
}