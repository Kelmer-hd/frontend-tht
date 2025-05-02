// src/app/features/inventarios/components/lista-salidas/lista-salidas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { SalidaCorte, SalidaCorteFiltro } from '../../../interface/salida-corte.interface';
import { DialogService } from '../../../service/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { SalidaTelaDialogComponent } from '../salida-tela-dialog/salida-tela-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista-salidas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './lista-salidas.component.html'
})
export class ListaSalidasComponent implements OnInit {
  // Lista de salidas
  salidas: SalidaCorte[] = [];
  
  // Datos de paginación
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  
  // Formulario de filtros
  filtroForm!: FormGroup;
  
  // Estados de UI
  loading = false;
  mostrarFiltros = false;
  filtrosAplicados = false;

  constructor(
    private salidaCorteService: SalidaCorteService,
    private router: Router,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarSalidas();
  }

  /**
   * Inicializa el formulario de filtros
   */
  inicializarFormulario(): void {
    this.filtroForm = this.fb.group({
      op: [''],
      areaDestino: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  /**
   * Carga la lista de salidas aplicando filtros y paginación
   */
  cargarSalidas(): void {
    this.loading = true;
    
    // Obtener filtros del formulario
    const filtros: SalidaCorteFiltro = {};
    
    const op = this.filtroForm.get('op')?.value;
    if (op) filtros.op = op;
    
    const areaDestino = this.filtroForm.get('areaDestino')?.value;
    if (areaDestino) filtros.areaDestino = areaDestino;
    
    const fechaInicio = this.filtroForm.get('fechaInicio')?.value;
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    
    const fechaFin = this.filtroForm.get('fechaFin')?.value;
    if (fechaFin) filtros.fechaFin = fechaFin;
    
    // Llamar al servicio
    this.salidaCorteService.buscarSalidas(filtros, this.currentPage, this.pageSize)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.salidas = response.content;
          this.totalItems = response.totalElements;
          
          // Verificar si hay filtros aplicados
          this.filtrosAplicados = 
            Boolean(filtros.op) || 
            Boolean(filtros.areaDestino) || 
            Boolean(filtros.fechaInicio) || 
            Boolean(filtros.fechaFin);
        },
        error: () => {
          // Error manejado por el interceptor global
        }
      });
  }

  /**
   * Aplica los filtros y recarga la lista
   */
  aplicarFiltros(): void {
    this.currentPage = 0; // Volver a la primera página al filtrar
    this.cargarSalidas();
    this.mostrarFiltros = false; // Ocultar panel de filtros al aplicar
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.currentPage = 0;
    this.cargarSalidas();
    this.mostrarFiltros = false;
  }

  /**
   * Cambia a la página especificada
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 0 && pagina < Math.ceil(this.totalItems / this.pageSize)) {
      this.currentPage = pagina;
      this.cargarSalidas();
    }
  }

  /**
   * Navega al detalle de una salida
   */
  verDetalle(id: number): void {
    this.router.navigate(['/inventarios/salidas', id]);
  }

  /**
   * Muestra u oculta el panel de filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Abre el diálogo para registrar una nueva salida de tela
   */
  nuevaSalida(): void {
    // Aquí normalmente primero seleccionarías una tela,
    // pero para simplificar, asumimos que tienes alguna forma de obtener la tela seleccionada
    // Por ejemplo, podrías abrir un diálogo para seleccionar tela y luego abrir el diálogo de salida
    
    this.router.navigate(['/inventarios/telas']); // Navegar a la lista de telas para seleccionar una
  }

  /**
   * Formatea una fecha para mostrarla en la UI
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
      
      return fechaObj.toLocaleDateString('es-ES');
    } catch (e) {
      return 'Fecha inválida';
    }
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'ANULADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Calcula el rango de elementos mostrados para la UI de paginación
   */
  get rangoElementos(): string {
    const inicio = this.currentPage * this.pageSize + 1;
    const fin = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
    return `${inicio} - ${fin} de ${this.totalItems}`;
  }

  /**
   * Determina si hay una página siguiente disponible
   */
  get tieneSiguiente(): boolean {
    return (this.currentPage + 1) * this.pageSize < this.totalItems;
  }

  /**
   * Determina si hay una página anterior disponible
   */
  get tieneAnterior(): boolean {
    return this.currentPage > 0;
  }
}