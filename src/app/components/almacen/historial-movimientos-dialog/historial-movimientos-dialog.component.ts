// src/app/features/inventarios/dialogs/historial-movimientos-dialog/historial-movimientos-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { MovimientoTela } from '../../../interface/movimiento-tela.interface';
import { SalidaCorte } from '../../../interface/salida-corte.interface';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-historial-movimientos-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-movimientos-dialog.component.html',
  providers: [DatePipe]
})
export class HistorialMovimientosDialogComponent implements OnInit {
  telaId: number = 0; // inicializar con un valor predeterminado
  movimientos: MovimientoTela[] = [];
  salidas: SalidaCorte[] = [];
  loading = true;
  historialCombinado: any[] = [];

  // Filtros
  filtroTipo: string = 'todos';

  public data: { telaId: number };
  public dialogRef: any;

  constructor(
    private movimientoTelaService: MovimientoTelaService,
    private salidaCorteService: SalidaCorteService,
    private datePipe: DatePipe
    // Eliminar las inyecciones de 'MAT_DIALOG_DATA' y 'MatDialogRef'
  ) {
    // Inicializar las propiedades
    this.data = { telaId: 0 };
    this.dialogRef = null;
  }

  ngOnInit(): void {
    // Asignar el telaId del data
    if (this.data && this.data.telaId) {
      this.telaId = this.data.telaId;
    }
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;

    forkJoin({
      movimientos: this.movimientoTelaService.obtenerHistorialTela(this.telaId),

    }).subscribe({
      next: (resultado) => {
        this.movimientos = resultado.movimientos;
        this.combinarHistorial();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial', error);
        this.loading = false;
        alert('No se pudo cargar el historial de movimientos');
      }
    });
  }

  combinarHistorial(): void {
    // Combinar movimientos
    const movimientosFormateados = this.movimientos.map(m => ({
      id: m.id,
      fecha: this.crearFechaSegura(m.fechaMovimiento),
      tipo: 'MOVIMIENTO',
      subtipo: m.tipoMovimiento,
      origen: m.areaOrigen,
      destino: m.areaDestino || 'N/A',
      cantidad: m.cantidad,
      estado: m.estado,
      usuario: m.usuarioResponsable,
      observaciones: m.observaciones || '',
      referencia: m.referenciaDocumento || ''
    }));
    // Combinar salidas
    const salidasFormateadas = this.salidas.map(s => ({
      id: s.id,
      fecha: new Date(s.fechaSalida),
      tipo: 'SALIDA',
      subtipo: 'SALIDA_CORTE',
      origen: 'ALMACEN_PRINCIPAL',
      destino: s.areaDestino,
      cantidad: s.salidaCorte,
      estado: s.estado,
      usuario: s.usuarioResponsable,
      observaciones: '',
      referencia: s.notaSalida
    }));

    // Unir ambos arrays y ordenar por fecha descendente
    this.historialCombinado = [...movimientosFormateados, ...salidasFormateadas]
      .sort((a, b) => {
        // Manejar casos donde fecha puede ser null
        if (!a.fecha) return 1;  // Mover elementos con fecha null al final
        if (!b.fecha) return -1; // Mover elementos con fecha null al final
        return b.fecha.getTime() - a.fecha.getTime();
      });

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let historialFiltrado = [...this.historialCombinado];

    // Filtrar por tipo
    if (this.filtroTipo !== 'todos') {
      historialFiltrado = historialFiltrado.filter(item =>
        this.filtroTipo === 'movimientos' ? item.tipo === 'MOVIMIENTO' : item.tipo === 'SALIDA'
      );
    }

    this.historialCombinado = historialFiltrado;
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha || isNaN(fecha.getTime())) {
      return 'Fecha no disponible';
    }
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm') || '';
  }

  crearFechaSegura(fechaStr: string | null): Date | null {
    if (!fechaStr) return null;
    const fecha = new Date(fechaStr);
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  getEstadoClase(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'ANULADO':
        return 'bg-red-100 text-red-800';
      case 'COMPLETADO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  cambiarFiltro(): void {
    this.aplicarFiltros();
  }
}