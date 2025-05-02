import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlmacenDTO, AlmacenCreateDTO } from '../interface/almacen.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private apiUrl = `${environment.apiUrl}/almacenes`;
  // private apiUrl = 'http://localhost:8080/api/almacenes';
  
  constructor(private http: HttpClient) {}
  
  getAll(): Observable<AlmacenDTO[]> {
    return this.http.get<AlmacenDTO[]>(this.apiUrl);
  }
  
  getById(id: number): Observable<AlmacenDTO> {
    return this.http.get<AlmacenDTO>(`${this.apiUrl}/${id}`);
  }
  
  create(almacen: AlmacenCreateDTO): Observable<AlmacenDTO> {
    return this.http.post<AlmacenDTO>(this.apiUrl, almacen);
  }
  
  update(id: number, almacen: AlmacenCreateDTO): Observable<AlmacenDTO> {
    return this.http.put<AlmacenDTO>(`${this.apiUrl}/${id}`, almacen);
  }
  
  inactivate(id: number): Observable<AlmacenDTO> {
    const url = `${this.apiUrl}/${id}/inactivate`;
    console.log('Inactivate URL:', url); // Para debugging
    return this.http.patch<AlmacenDTO>(url, {});
  }

  cambiarEstado(id: number, estado: string): Observable<AlmacenDTO> {
    return this.http.patch<AlmacenDTO>(
      `${this.apiUrl}/${id}/cambiar-estado`, 
      { estado: estado }
    );
  }
  
}