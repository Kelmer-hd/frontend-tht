import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tela, TelaCreateDTO, TelaFiltroDTO, TelasPaginadas } from '../interface/tela.interface';
import { ImportacionResultado } from '../interface/almacen-tela.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TelaService {
  private apiUrl = `${environment.apiUrl}/telas`;
  
  // Criterios de agrupación válidos para estadísticas
  private criteriosValidos = ['proveedor', 'cliente', 'marca', 'tipotela', 'estado', 'almacen'];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las telas
   */
  getTelas(): Observable<Tela[]> {
    return this.http.get<Tela[]>(this.apiUrl);
  }

  /**
   * Obtiene una tela por su ID
   */
  getTelaById(id: number): Observable<Tela> {
    return this.http.get<Tela>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca telas con paginación y filtros básicos
   */
  buscarTelas(
    termino?: string,
    campo: string = 'todos',
    ordenCampo: string = 'fechaIngreso',
    ordenDir: string = 'desc',
    pagina: number = 0,
    tamanoPagina: number = 10
  ): Observable<TelasPaginadas> {
    let params = new HttpParams();
    
    if (termino) {
      params = params.set('termino', termino);
    }
    
    params = params
      .set('campo', campo)
      .set('ordenCampo', ordenCampo)
      .set('ordenDir', ordenDir)
      .set('pagina', pagina.toString())
      .set('tamanoPagina', tamanoPagina.toString());
    
    return this.http.get<TelasPaginadas>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  buscarTelasAvanzado(
    filtros: TelaFiltroDTO,
    ordenCampo: string = 'fechaIngreso',
    ordenDir: string = 'desc',
    pagina: number = 0,
    tamanoPagina: number = 10
  ): Observable<TelasPaginadas> {
    let params = new HttpParams()
      .set('ordenCampo', ordenCampo)
      .set('ordenDir', ordenDir)
      .set('pagina', pagina.toString())
      .set('tamanoPagina', tamanoPagina.toString());
    
    return this.http.post<TelasPaginadas>(`${this.apiUrl}/buscar/avanzado`, filtros, { params });
  }

  /**
   * Busca telas por rango de fechas
   */
  getTelasByFechaIngreso(fechaInicio: string, fechaFin: string): Observable<Tela[]> {
    const params = new HttpParams()
      .set('inicio', fechaInicio)
      .set('fin', fechaFin);
    
    return this.http.get<Tela[]>(`${this.apiUrl}/buscar/fechas`, { params });
  }

  /**
   * Crea una nueva tela
   */
  createTela(tela: TelaCreateDTO): Observable<Tela> {
    return this.http.post<Tela>(this.apiUrl, tela);
  }

  /**
   * Actualiza una tela existente
   */
  updateTela(id: number, tela: TelaCreateDTO): Observable<Tela> {
    return this.http.put<Tela>(`${this.apiUrl}/${id}`, tela);
  }

  /**
   * Elimina una tela
   */
  deleteTela(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene estadísticas según criterio
   */
  getEstadisticas(criterio: string = 'proveedor'): Observable<any[]> {
    const params = new HttpParams().set('criterio', criterio);
    return this.http.get<any[]>(`${this.apiUrl}/estadisticas`, { params });
  }

  /**
   * Obtiene estadísticas mensuales
   */
  getEstadisticasMensuales(año?: number): Observable<any[]> {
    let params = new HttpParams();
    if (año) {
      params = params.set('año', año.toString());
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/estadisticas/mensual`, { params });
  }

  /**
   * Descarga reporte en formato específico
   */
  descargarReporte(formato: string = 'excel'): void {
    window.open(`${this.apiUrl}/reportes?formato=${formato}`, '_blank');
  }

  /**
   * Genera reporte filtrado en formato específico
   */
  generarReporteFiltrado(filtros: TelaFiltroDTO, formato: string = 'excel'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reportes/filtrado?formato=${formato}`, filtros, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga la plantilla Excel para un almacén específico
   */
  descargarPlantilla(almacenId: number): void {
    window.open(`${environment.apiUrl}/almacenes/${almacenId}/telas/plantilla`, '_blank');
  }

  /**
   * Importa telas desde un archivo Excel para un almacén específico
   */
  importarTelasDesdeExcel(almacenId: number, file: File): Observable<ImportacionResultado> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImportacionResultado>(
      `${environment.apiUrl}/almacenes/${almacenId}/telas/importar`,
      formData
    );
  }

  /**
   * Obtiene las telas asignadas a un almacén específico
   */
  getTelasDeAlmacen(almacenId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/almacen-telas/almacen/${almacenId}`);
  }

  /**
   * Busca telas en un almacén con filtros, ordenamiento y paginación
   */
  buscarTelasEnAlmacen(
    almacenId: number, 
    busqueda: {
      termino?: string;
      campo?: string;
      ordenCampo?: string;
      ordenDir?: string;
      pagina: number;
      tamanoPagina: number;
    }
  ): Observable<TelasPaginadas> {
    return this.http.post<TelasPaginadas>(
      `${environment.apiUrl}/almacen-telas/almacen/${almacenId}/buscar`,
      busqueda
    );
  }
}