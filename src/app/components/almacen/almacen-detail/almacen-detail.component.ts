// src/app/features/inventarios/almacen-detail/almacen-detail.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AlmacenService } from '../../../service/almancen.service';
import { TelaService } from '../../../service/tela.service';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { AlmacenTelaService } from '../../../service/almacen-tela.service';
import { DialogService } from '../../../service/dialog.service';

import { AlmacenDTO } from '../../../interface/almacen.interface';
import { Tela, TelasPaginadas } from '../../../interface/tela.interface';

import { SalidaTelaDialogComponent } from '../salida-tela-dialog/salida-tela-dialog.component';
import { MovimientoTelaDialogComponent } from '../movimiento-tela-dialog/movimiento-tela-dialog.component';
import { HistorialMovimientosDialogComponent } from '../historial-movimientos-dialog/historial-movimientos-dialog.component';

interface TelaConAlmacen extends Tela {
  almacenTela?: {
    peso: number;
  };
  stockReal: number;
}

@Component({
  selector: 'app-almacen-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './almacen-detail.component.html',
  providers: [DatePipe]
})
export class AlmacenDetailComponent implements OnInit, OnDestroy {
  // Servicios inyectados mediante método inject()
  private toastr = inject(ToastrService);
  
  // Signals para estado reactivo
  almacenId = signal<number | null>(null);
  almacen = signal<AlmacenDTO | null>(null);
  telasFiltradas = signal<TelaConAlmacen[]>([]);
  telasFiltradasTotal = signal<number>(0);
  loading = signal<boolean>(false);
  mostrarModalTransferencia = signal<boolean>(false);
  telaSeleccionada = signal<TelaConAlmacen | null>(null);
  almacenesDisponibles = signal<AlmacenDTO[]>([]);
  pesoDisponible = signal<number>(0);

  // Variables para búsqueda y filtrado reactivas
  terminoBusqueda = new FormControl('');
  filtroCampo = new FormControl('todos');

  // Variables de estado
  ordenActual = signal<string>('fechaIngreso');
  ordenAscendente = signal<boolean>(false);
  
  // Paginación
  paginaActual = signal<number>(1);
  registrosPorPagina = signal<number>(10);
  totalPaginas = signal<number>(0);
  paginasDisponibles = signal<number[]>([]);
  
  // Modal de transferencia
  almacenDestinoId: number | null = null;
  pesoTransferir: number = 0;

  // Control de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private almacenService: AlmacenService,
    private telaService: TelaService,
    private almacenTelaService: AlmacenTelaService,
    private salidaCorteService: SalidaCorteService,
    private movimientoTelaService: MovimientoTelaService,
    private dialogService: DialogService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Suscripción a parámetros de ruta
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.almacenId.set(+idParam);
        this.cargarAlmacen();
        this.cargarTelasDelAlmacen();
      } else {
        this.router.navigate(['/inventarios/almacenes']);
      }
    });

    // Configurar búsqueda reactiva
    this.terminoBusqueda.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paginaActual.set(1);
      this.cargarTelasDelAlmacen();
    });

    // Cambio de campo de filtro
    this.filtroCampo.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cargarTelasDelAlmacen();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarAlmacen(): void {
    this.loading.set(true);
    
    if (!this.almacenId()) {
      this.router.navigate(['/inventarios/almacenes']);
      return;
    }
    
    this.almacenService.getById(this.almacenId()!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.almacen.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/inventarios/almacenes']);
        // El interceptor ya maneja la visualización de errores
      }
    });
  }

  cargarTelasDelAlmacen(): void {
    this.loading.set(true);

    if (!this.almacenId()) {
      this.loading.set(false);
      return;
    }

    const busqueda = {
      termino: this.terminoBusqueda.value || '',
      campo: this.filtroCampo.value || 'todos',
      ordenCampo: this.ordenActual(),
      ordenDir: this.ordenAscendente() ? 'asc' : 'desc',
      pagina: this.paginaActual() - 1,  // Ajuste porque el backend usa 0-index
      tamanoPagina: this.registrosPorPagina()
    };

    this.telaService.buscarTelasEnAlmacen(this.almacenId()!, busqueda).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        return of({ datos: [], total: 0, totalPaginas: 0, pagina: 0, tamanoPagina: 0 } as TelasPaginadas);
      })
    ).subscribe(respuesta => {
      this.telasFiltradas.set(respuesta.datos as TelaConAlmacen[]);
      this.telasFiltradasTotal.set(respuesta.total);
      this.totalPaginas.set(respuesta.totalPaginas);
      this.configurarPaginacion();
      this.loading.set(false);
    });
  }

  // Métodos para búsqueda y filtrado
  buscarTelas(): void {
    this.paginaActual.set(1);
    this.cargarTelasDelAlmacen();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda.setValue('', { emitEvent: false });
    this.filtroCampo.setValue('todos', { emitEvent: false });
    this.paginaActual.set(1);
    this.cargarTelasDelAlmacen();
  }

  ordenarPor(campo: string): void {
    if (this.ordenActual() === campo) {
      this.ordenAscendente.update(valor => !valor);
    } else {
      this.ordenActual.set(campo);
      this.ordenAscendente.set(true);
    }

    this.cargarTelasDelAlmacen();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return;
    }

    this.paginaActual.set(pagina);
    this.cargarTelasDelAlmacen();
  }

  configurarPaginacion(): void {
    const paginasArray: number[] = [];
    const maxPaginas = 5;
    
    let inicio = Math.max(1, this.paginaActual() - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas(), inicio + maxPaginas - 1);

    // Ajustar inicio si estamos cerca del final
    if (fin - inicio + 1 < maxPaginas && fin === this.totalPaginas()) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginasArray.push(i);
    }
    
    this.paginasDisponibles.set(paginasArray);
  }

  verDetalleTela(telaId: number): void {
    this.router.navigate(['/inventarios/telas', telaId]);
  }

  editarTela(telaId: number): void {
    this.router.navigate(['/inventarios/telas', telaId, 'editar']);
  }

  nuevaTela(): void {
    this.router.navigate(['/inventarios/telas/nuevo'], {
      queryParams: { almacenId: this.almacenId() }
    });
  }

  importarTelas(): void {
    if (!this.almacenId()) return;
    
    this.router.navigate(['/inventarios/almacenes', this.almacenId(), 'telas', 'importar']);
  }

  volverAlmacenes(): void {
    this.router.navigate(['/inventarios/almacenes']);
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'N/A';
  }

  // Métodos para modal de transferencia
  abrirModalTransferencia(item: TelaConAlmacen): void {
    this.telaSeleccionada.set(item);

    // Determinar el peso disponible del almacén de telas
    if (item.almacenTela?.peso === undefined) {
      this.toastr.warning('No se pudo determinar el peso disponible');
      this.pesoDisponible.set(0); // Establecer en 0 para evitar errores
    } else {
      this.pesoDisponible.set(item.almacenTela.peso);
    }

    this.pesoTransferir = 0;
    this.almacenDestinoId = null;
    this.cargarAlmacenesDisponibles();
    this.mostrarModalTransferencia.set(true);
  }

  cargarAlmacenesDisponibles(): void {
    if (!this.almacenId()) return;
    
    this.loading.set(true);
    
    this.almacenService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (almacenes) => {
        this.almacenesDisponibles.set(almacenes.filter(a => a.id !== this.almacenId()));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // El interceptor ya maneja la visualización de errores
      }
    });
  }

  realizarTransferencia(): void {
    if (!this.almacenDestinoId || this.pesoTransferir <= 0 || !this.telaSeleccionada()) {
      this.toastr.warning('Por favor completa todos los campos correctamente');
      return;
    }
    
    if (this.pesoTransferir > this.pesoDisponible()) {
      this.toastr.warning('El peso a transferir excede el disponible');
      return;
    }
    
    if (!this.almacenId()) return;
    
    const almacenDestinoId = Number(this.almacenDestinoId);
    const tela = this.telaSeleccionada()!;
    const telaId = tela.tela?.id || tela.id;
    
    if (!telaId) {
      this.toastr.error('No se pudo obtener el ID de la tela');
      return;
    }
    
    this.loading.set(true);
    
    this.almacenTelaService.transferirTela(
      this.almacenId()!,
      almacenDestinoId,
      telaId,
      this.pesoTransferir
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.mostrarModalTransferencia.set(false);
        this.toastr.success('Transferencia realizada con éxito');
        this.cargarTelasDelAlmacen();
      },
      error: () => {
        this.loading.set(false);
        // El interceptor ya maneja la visualización de errores
      }
    });
  }

  cerrarModalTransferencia(): void {
    this.mostrarModalTransferencia.set(false);
  }

  // Método para registrar salida de tela
  registrarSalidaTela(item: TelaConAlmacen): void {
    // Asegurarnos de obtener el objeto tela correcto
    let tela: Tela = {
      id: item.id,
      numGuia: item.numGuia,
      partida: item.partida,
      os: item.os,
      proveedor: item.proveedor,
      fechaIngreso: item.fechaIngreso,
      cliente: item.cliente,
      marca: item.marca,
      op: item.op,
      tipoTela: item.tipoTela,
      descripcion: item.descripcion,
      ench: item.ench,
      cantRolloIngresado: item.cantRolloIngresado,
      pesoIngresado: item.pesoIngresado,
      stockReal: item.stockReal,
      estado: item.estado,
      almacen: item.almacen,
      fechaCreacion: item.fechaCreacion,
      fechaActualizacion: item.fechaActualizacion
    };

    if (!tela || !tela.id) {
      this.toastr.error('No se pudo obtener la información de la tela');
      return;
    }

    // Verificar stock disponible
    if (item && (item.stockReal === null || item.stockReal === undefined || item.stockReal <= 0)) {
      this.toastr.warning('Esta tela no tiene stock disponible para registrar una salida');
      return;
    }

    // Abrir el modal de registro de salida
    const dialogRef = this.dialogService.open(SalidaTelaDialogComponent, {
      data: { tela }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result === true) {
        // Si se registró correctamente la salida, recargar las telas
        this.cargarTelasDelAlmacen();
      }
    });
  }

  // Método para registrar movimiento de tela
  registrarMovimientoTela(item: TelaConAlmacen): void {
    // Asegurarnos de obtener el objeto tela correcto
    let tela: Tela;
    if (!item) {
      this.toastr.error('No se pudo obtener la información de la tela');
      return;
    }
    
    tela = {
      id: item.id,
      numGuia: item.numGuia,
      partida: item.partida,
      os: item.os,
      proveedor: item.proveedor,
      fechaIngreso: item.fechaIngreso,
      cliente: item.cliente,
      marca: item.marca,
      op: item.op,
      tipoTela: item.tipoTela,
      descripcion: item.descripcion,
      ench: item.ench,
      cantRolloIngresado: item.cantRolloIngresado,
      pesoIngresado: item.pesoIngresado,
      stockReal: item.stockReal,
      estado: item.estado,
      almacen: item.almacen,
      fechaCreacion: item.fechaCreacion,
      fechaActualizacion: item.fechaActualizacion
    };

    if (!tela || !tela.id) {
      this.toastr.error('No se pudo obtener la información de la tela');
      return;
    }

    // Verificar stock disponible
    if (item && (item.stockReal === null || item.stockReal === undefined || item.stockReal <= 0)) {
      this.toastr.warning('Esta tela no tiene stock disponible para registrar un movimiento');
      return;
    }

    // Obtener el área actual del almacén (o usar un valor por defecto)
    const almacenActual = this.almacen();
    const areaOrigen = almacenActual?.tipoAlmacen === 'PRINCIPAL' ? 'ALMACEN_PRINCIPAL' : 'ALMACEN_SECUNDARIO';

    // Abrir el modal de registro de movimiento
    const dialogRef = this.dialogService.open(MovimientoTelaDialogComponent, {
      data: {
        tela,
        areaOrigen
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result === true) {
        // Si se registró correctamente el movimiento, recargar las telas
        this.cargarTelasDelAlmacen();
      }
    });
  }

  // Método para ver historial de movimientos
  verHistorialMovimientos(telaId: number): void {
    if (!telaId) {
      this.toastr.error('ID de tela no válido');
      return;
    }

    // Abrir el modal de historial
    this.dialogService.open(HistorialMovimientosDialogComponent, {
      data: { telaId: telaId }
    });
  }

  // Método para actualizar el número de registros por página
  cambiarRegistrosPorPagina(cantidad: number): void {
    this.registrosPorPagina.set(cantidad);
    this.paginaActual.set(1);
    this.cargarTelasDelAlmacen();
  }

  // Método para obtener el estado de los controles
  get hasFiltrosActivos(): boolean {
    return !!this.terminoBusqueda.value;
  }
  
  get tieneTelasFiltradas(): boolean {
    return this.telasFiltradas().length > 0;
  }
}
  }
  
  get tieneTelasFiltradas(): boolean {
    return this.telasFiltradas().length > 0;
  }
}
