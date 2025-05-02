// src/app/features/inventarios/components/historial-salidas/historial-salidas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { SalidaCorte, SalidaCorteFiltro } from '../../../interface/salida-corte.interface';

@Component({
  selector: 'app-historial-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historial-salida.component.html'
})
export class HistorialSalidasComponent implements OnInit {
  // Filtros de búsqueda
  filtros: SalidaCorteFiltro = {};
  
  // Datos y paginación
  salidas: SalidaCorte[] = [];
  totalItems = 0;
  paginaActual = 0;
  itemsPorPagina = 10;
  
  // Estados
  loading = false;

  Math = Math;
  
  constructor(private salidaCorteService: SalidaCorteService) {}
  
  ngOnInit(): void {
    this.cargarSalidas();
  }
  
  cargarSalidas(): void {
    this.loading = true;
    this.salidaCorteService.buscarSalidas(this.filtros, this.paginaActual, this.itemsPorPagina)
      .subscribe({
        next: (response) => {
          this.salidas = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          // El interceptor global manejará la notificación del error
        }
      });
  }
  
  buscar(): void {
    this.paginaActual = 0;
    this.cargarSalidas();
  }
  
  limpiarFiltros(): void {
    this.filtros = {};
    this.paginaActual = 0;
    this.cargarSalidas();
  }
  
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarSalidas();
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.totalItems / this.itemsPorPagina);
  }
  
  get paginasDisponibles(): number[] {
    // Mostrar máximo 5 páginas en la paginación
    const maxPaginas = 5;
    let inicio = Math.max(0, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas - 1, inicio + maxPaginas - 1);
    
    // Ajustar inicio si estamos cerca del final
    if (fin - inicio + 1 < maxPaginas && fin === this.totalPaginas - 1) {
      inicio = Math.max(0, fin - maxPaginas + 1);
    }
    
    const paginas = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }
  
  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    const fecha = new Date(date);
    return fecha.toLocaleDateString();
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}