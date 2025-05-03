// src/app/features/inventarios/almacen-detail/almacen-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../../../service/almancen.service';
import { TelaService } from '../../../service/tela.service';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { AlmacenDTO } from '../../../interface/almacen.interface';
import { Tela } from '../../../interface/tela.interface';
import { AlmacenTelaService } from '../../../service/almacen-tela.service';
import { DialogService } from '../../../service/dialog.service';
import { SalidaTelaDialogComponent } from '../salida-tela-dialog/salida-tela-dialog.component';
import { MovimientoTelaDialogComponent } from '../movimiento-tela-dialog/movimiento-tela-dialog.component';
import { HistorialMovimientosDialogComponent } from '../historial-movimientos-dialog/historial-movimientos-dialog.component';

@Component({
  selector: 'app-almacen-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './almacen-detail.component.html',
  providers: [DatePipe]
})
export class AlmacenDetailComponent implements OnInit {
  almacenId!: number;
  almacen: AlmacenDTO | null = null;
  telas: any[] = [];
  telasFiltradas: any[] = [];
  telasFiltradasTotal: number = 0;
  loading: boolean = false;

  // Variables para búsqueda y filtrado
  terminoBusqueda: string = '';
  filtroCampo: string = 'todos';
  telasOriginales: any[] = [];

  // Variables para ordenamiento
  ordenActual: string = 'fechaIngreso';
  ordenAscendente: boolean = false;

  // Configuración de paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalPaginas: number = 0;
  paginasDisponibles: number[] = [];

  // Variables para el modal de transferencia
  mostrarModalTransferencia: boolean = false;
  telaSeleccionada: any = null;
  almacenesDisponibles: AlmacenDTO[] = [];
  almacenDestinoId: number | null = null;
  pesoTransferir: number = 0;
  pesoDisponible: number = 0;

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
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.almacenId = +idParam;
        this.cargarAlmacen();
        this.cargarTelasDelAlmacen();
      } else {
        this.router.navigate(['/inventarios/almacenes']);
      }
    });
  }

  cargarAlmacen(): void {
    this.loading = true;
    this.almacenService.getById(this.almacenId).subscribe({
      next: (data) => {
        this.almacen = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el almacén', error);
        this.loading = false;
        alert('No se pudo cargar la información del almacén');
        this.router.navigate(['/inventarios/almacenes']);
      }
    });
  }

  cargarTelasDelAlmacen(): void {
    this.loading = true;

    const busqueda = {
      termino: this.terminoBusqueda,
      campo: this.filtroCampo,
      ordenCampo: this.ordenActual,
      ordenDir: this.ordenAscendente ? 'asc' : 'desc',
      pagina: this.paginaActual - 1,  // Ajuste porque el backend usa 0-index
      tamanoPagina: this.registrosPorPagina
    };

    this.telaService.buscarTelasEnAlmacen(this.almacenId, busqueda).subscribe({
      next: (respuesta) => {
        this.telasFiltradas = respuesta.datos;
        this.telasFiltradasTotal = respuesta.total;
        this.totalPaginas = respuesta.totalPaginas;
        this.configurarPaginacion();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar telas del almacén', error);
        this.loading = false;
      }
    });
  }

  // Métodos para búsqueda y filtrado
  buscarTelas(): void {
    this.paginaActual = 1;  // Resetear a primera página
    this.cargarTelasDelAlmacen();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroCampo = 'todos';
    this.paginaActual = 1;
    this.cargarTelasDelAlmacen();
  }

  ordenarPor(campo: string): void {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }

    this.cargarTelasDelAlmacen();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }

    this.paginaActual = pagina;
    this.cargarTelasDelAlmacen();
  }

  configurarPaginacion(): void {
    this.paginasDisponibles = [];

    // Mostrar máximo 5 páginas en la paginación
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);

    // Ajustar inicio si estamos cerca del final
    if (fin - inicio + 1 < maxPaginas && fin === this.totalPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      this.paginasDisponibles.push(i);
    }
  }

  verDetalleTela(telaId: number): void {
    this.router.navigate(['/inventarios/telas', telaId]);
  }

  editarTela(telaId: number): void {
    this.router.navigate(['/inventarios/telas', telaId, 'editar']);
  }

  nuevaTela(): void {
    this.router.navigate(['/inventarios/telas/nuevo'], {
      queryParams: { almacenId: this.almacenId }
    });
  }

  importarTelas(): void {
    this.router.navigate(['/inventarios/almacenes', this.almacenId, 'telas', 'importar']);
  }

  volverAlmacenes(): void {
    this.router.navigate(['/inventarios/almacenes']);
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'N/A';
  }

  // Métodos para modal de transferencia
  abrirModalTransferencia(item: any): void {
    this.telaSeleccionada = item;
    
    // Determinar correctamente el peso disponible
    if (item.almacenTela && item.almacenTela.peso !== undefined) {
      this.pesoDisponible = item.almacenTela.peso;
    } else if (item.tela && item.tela.pesoIngresado !== undefined) {
      this.pesoDisponible = item.tela.pesoIngresado;
    } else if (item.pesoIngresado !== undefined) {
      this.pesoDisponible = item.pesoIngresado;
    } else if (typeof item.peso === 'number') {
      this.pesoDisponible = item.peso;
    } else {
      this.pesoDisponible = 0;
      console.warn('No se pudo determinar el peso disponible:', item);
    }
    
    this.pesoTransferir = 0;
    this.almacenDestinoId = null;
    this.cargarAlmacenesDisponibles();
    this.mostrarModalTransferencia = true;
  }

  cargarAlmacenesDisponibles(): void {
    this.almacenService.getAll().subscribe({
      next: (almacenes) => {
        this.almacenesDisponibles = almacenes.filter(a => a.id !== this.almacenId);
      },
      error: (error) => {
        console.error('Error al cargar almacenes', error);
        alert('No se pudieron cargar los almacenes disponibles');
      }
    });
  }

  realizarTransferencia(): void {
    if (!this.almacenDestinoId || this.pesoTransferir <= 0 || !this.telaSeleccionada) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }
    
    const almacenDestinoId = Number(this.almacenDestinoId);
    const telaId = this.telaSeleccionada.tela?.id || this.telaSeleccionada.telaId;
    
    const datos = {
      almacenOrigenId: this.almacenId,
      almacenDestinoId: almacenDestinoId,
      telaId: telaId,
      peso: this.pesoTransferir
    };
    
    this.almacenTelaService.transferirTela(
      datos.almacenOrigenId,
      datos.almacenDestinoId,
      datos.telaId,
      datos.peso
    ).subscribe({
      next: () => {
        this.mostrarModalTransferencia = false;
        alert('Transferencia realizada con éxito');
        this.cargarTelasDelAlmacen();
      },
      error: (error) => {
        console.error('Error al transferir tela', error);
        
        let mensajeError = 'No se pudo realizar la transferencia';
        if (error.status === 404) {
          mensajeError = 'La tela no existe en este almacén';
        } else if (error.status === 400) {
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else {
            mensajeError = 'El peso a transferir excede el disponible o datos incorrectos';
          }
        }
        
        alert(mensajeError);
      }
    });
  }

  cerrarModalTransferencia(): void {
    this.mostrarModalTransferencia = false;
  }

  // Nuevos métodos para operaciones con telas
  
  // Método para registrar salida de tela
  registrarSalidaTela(tela: any): void {
    // Asegurarnos de obtener el objeto tela correcto
    const telaObj = tela.tela || tela;
    
    if (!telaObj || !telaObj.id) {
      console.error('No se pudo obtener la información de la tela');
      alert('Error: No se pudo obtener la información de la tela');
      return;
    }
    
    // Verificar stock disponible
    if (telaObj.stockReal <= 0) {
      alert('Esta tela no tiene stock disponible para registrar una salida');
      return;
    }
    
    // Abrir el modal de registro de salida
    const dialogRef = this.dialogService.open(SalidaTelaDialogComponent, {
      data: { tela: telaObj }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si se registró correctamente la salida, recargar las telas
        this.cargarTelasDelAlmacen();
      }
    });
  }

  // Método para registrar movimiento de tela
  registrarMovimientoTela(tela: any): void {
    // Asegurarnos de obtener el objeto tela correcto
    const telaObj = tela.tela || tela;
    
    if (!telaObj || !telaObj.id) {
      console.error('No se pudo obtener la información de la tela');
      alert('Error: No se pudo obtener la información de la tela');
      return;
    }
    
    // Verificar stock disponible
    if (telaObj.stockReal <= 0) {
      alert('Esta tela no tiene stock disponible para registrar un movimiento');
      return;
    }
    
    // Obtener el área actual del almacén (o usar un valor por defecto)
    const areaOrigen = this.almacen?.tipoAlmacen === 'PRINCIPAL' ? 'ALMACEN_PRINCIPAL' : 'ALMACEN_SECUNDARIO';
    
    // Abrir el modal de registro de movimiento
    const dialogRef = this.dialogService.open(MovimientoTelaDialogComponent, {
      data: { 
        tela: telaObj,
        areaOrigen: areaOrigen
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si se registró correctamente el movimiento, recargar las telas
        this.cargarTelasDelAlmacen();
      }
    });
  }

  // Método para ver historial de movimientos
  verHistorialMovimientos(telaId: number): void {
    if (!telaId) {
      console.error('ID de tela no válido');
      return;
    }
    
    // Abrir el modal de historial
    this.dialogService.open(HistorialMovimientosDialogComponent, {
      data: { telaId: telaId }
    });
  }

  getTelaStock(item: any): number {
    // Intenta acceder al stock de diferentes maneras según la estructura
    if (item.tela && item.tela.stockReal !== undefined) {
      return item.tela.stockReal;
    } else if (item.stockReal !== undefined) {
      return item.stockReal;
    }
    // Valor por defecto
    return 0;
  }

}