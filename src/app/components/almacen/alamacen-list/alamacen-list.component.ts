import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlmacenService } from '../../../service/almancen.service';
import { AlmacenDTO } from '../../../interface/almacen.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista-almacenes',
  standalone: true,
  templateUrl: './alamacen-list.component.html',
  imports: [CommonModule],
})
export class ListaAlmacenesComponent implements OnInit {
  almacenes: AlmacenDTO[] = [];
  loading = false;
  
  constructor(
    private almacenService: AlmacenService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  
  ngOnInit(): void {
    this.loadAlmacenes();
  }
  
  loadAlmacenes(): void {
    this.loading = true;
    
    this.almacenService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.almacenes = data;
        },
        error: (err) => {
          console.error("Error al cargar almacenes", err);
        }
      });
  }
  
  // Método unificado para cambiar estado
  cambiarEstadoAlmacen(id: number, nuevoEstado: string): void {
    const esActivacion = nuevoEstado === 'ACTIVO';
    const accion = esActivacion ? 'activar' : 'inactivar';
    
    if (!confirm(`¿Está seguro que desea ${accion} este almacén?`)) {
      return;
    }
    
    const almacen = this.almacenes.find(a => a.id === id);
    const nombreAlmacen = almacen ? almacen.nombreAlmacen : `ID ${id}`;
    
    this.loading = true;
    this.almacenService.cambiarEstado(id, nuevoEstado)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          // Actualizar el estado del almacén en la lista
          const index = this.almacenes.findIndex(a => a.id === id);
          if (index !== -1) {
            this.almacenes[index] = data;
          }
          
          const mensaje = esActivacion 
            ? `Almacén "${nombreAlmacen}" activado correctamente` 
            : `Almacén "${nombreAlmacen}" inactivado correctamente`;
          
          this.toastr.success(mensaje, 'Éxito');
        },
        error: (err) => {
          console.error(`Error al ${accion} el almacén ${nombreAlmacen}`, err);
        }
      });
  }
  
  editar(id: number): void {
    this.router.navigate(['/inventarios/almacenes/editar', id]);
  }
  
  navegarCrear(): void {
    this.router.navigate(['/inventarios/almacenes/nuevo']);
  }
  
  verDetalle(id: number): void {
    this.router.navigate(['/inventarios/almacenes/detalle', id]);
  }
  
  trackById(index: number, almacen: AlmacenDTO): number {
    return almacen.id;
  }
}