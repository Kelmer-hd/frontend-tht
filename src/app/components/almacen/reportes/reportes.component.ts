import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TelaService } from '../../../service/tela.service';
import { TelaFiltroDTO } from '../../../interface/tela.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit, AfterViewInit {
  // Charts
  @ViewChild('proveedorChart') proveedorChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('clienteChart') clienteChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // Services
  private fb = inject(FormBuilder);
  private telaService = inject(TelaService);
  private toastr = inject(ToastrService);
  estadisticas: any[] = [];

  // Properties
  filtroForm!: FormGroup;
  criterioSeleccionado: string = 'proveedor';
  criteriosDisponibles: string[] = ['proveedor', 'cliente', 'marca', 'tipotela', 'estado', 'almacen'];

  // Charts
  charts: { [key: string]: Chart } = {};

  // Loading states
  cargandoEstadisticas: boolean = false;
  cargandoReporte: boolean = false;


  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEstadisticas(this.criterioSeleccionado);
  }

  ngAfterViewInit(): void {
    // Dar tiempo para que los elementos del DOM se inicialicen
    setTimeout(() => {
      if (this.estadisticas.length > 0) {
        this.renderizarGraficos();
      }
    }, 200);
  }

  /**
   * Inicializa el formulario de filtros
   */
  inicializarFormulario(): void {
    this.filtroForm = this.fb.group({
      numGuia: [''],
      proveedor: [''],
      cliente: [''],
      fechaInicio: [''],
      fechaFin: [''],
      descripcion: [''],
      os: [''],
      partida: [''],
      estado: [''],
      almacen: [''],
      tipoTela: ['']
    });
  }

  /**
   * Carga las estadísticas según el criterio seleccionado
   */
  cargarEstadisticas(criterio: string): void {
    console.log('Cargando estadísticas para criterio:', criterio);
    this.cargandoEstadisticas = true;
    this.criterioSeleccionado = criterio;

    // Limpiar estadísticas anteriores
    this.estadisticas = [];

    this.telaService.getEstadisticas(criterio)
      .pipe(
        catchError(error => {
          console.error('Error al cargar estadísticas:', error);
          this.toastr.error(`Error al cargar estadísticas: ${error.error?.detail || error.message || 'Error del servidor'}`, 'Error');
          return of([]);
        }),
        finalize(() => this.cargandoEstadisticas = false)
      )
      .subscribe(data => {
        console.log('Estadísticas recibidas:', data);
        this.estadisticas = data || [];

        if (this.estadisticas.length > 0) {
          // Dar tiempo para que el DOM se actualice
          setTimeout(() => {
            this.renderizarGraficos();
          }, 100);
        } else {
          this.toastr.info(`No hay datos disponibles para el criterio: ${criterio}`, 'Sin datos');
        }
      });
  }

  renderizarGraficos(): void {
    console.log('Buscando canvas para criterio:', this.criterioSeleccionado);

    // Primero destruir cualquier gráfico existente
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        console.log(`Destruyendo gráfico existente para: ${key}`);
        this.charts[key].destroy();
        delete this.charts[key];
      }
    });

    if (this.estadisticas.length === 0) {
      this.toastr.info('No hay datos disponibles para mostrar en el gráfico', 'Sin datos');
      return;
    }

    // Preparar datos para el gráfico
    const labels: string[] = [];
    const cantidadData: number[] = [];
    const pesoData: number[] = [];

    this.estadisticas.forEach(item => {
      const label = this.obtenerValorDeEstadistica(item, this.criterioSeleccionado) || 'No especificado';
      labels.push(label);
      cantidadData.push(item.cantidadTelas || 0);
      pesoData.push(parseFloat(item.totalPeso) || 0);
    });

    // Obtener el canvas según el criterio seleccionado
    let chartCanvas: HTMLCanvasElement | null = null;
    const canvasId = this.criterioSeleccionado + 'Chart';

    // Intentar obtener el canvas por ID
    chartCanvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!chartCanvas) {
      console.error(`No se encontró el canvas con ID: ${canvasId}`);
      return;
    }

    console.log('Canvas encontrado, renderizando gráfico');
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas');
      return;
    }

    try {
      this.charts[this.criterioSeleccionado] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Cantidad de Telas',
              data: cantidadData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Peso Total (kg)',
              data: pesoData,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              title: {
                display: true,
                text: 'Peso (kg)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al crear el gráfico:', error);
    }
  }

  obtenerValorDeEstadistica(item: any, campo: string): string {
    // Mapa de normalización para campos
    const campoNormalizado: { [key: string]: string } = {
      'tipotela': 'tipoTela',  // Mapear criterio 'tipotela' a propiedad 'tipoTela'
      'marca': 'marca',
      'proveedor': 'proveedor',
      'cliente': 'cliente',
      'estado': 'estado',
      'almacen': 'almacen'
    };

    // Usar la propiedad correcta
    const propiedadCorrecta = campoNormalizado[campo] || campo;
    return (item as any)[propiedadCorrecta] || '';
  }


  /**
   * Cambia el criterio de agrupación para las estadísticas
   */
  cambiarCriterio(criterio: string): void {
    // Destruir gráfico actual si existe
    if (this.charts[this.criterioSeleccionado]) {
      this.charts[this.criterioSeleccionado].destroy();
      delete this.charts[this.criterioSeleccionado];
    }

    this.criterioSeleccionado = criterio;
    this.cargarEstadisticas(criterio);
  }

  /**
   * Genera y descarga un reporte según los filtros aplicados
   */
  generarReporte(formato: string = 'excel'): void {
    this.cargandoReporte = true;

    // Construir el objeto de filtros a partir del formulario
    const filtrosForm: Record<string, any> = this.filtroForm.value;
    const filtros: Partial<TelaFiltroDTO> = {};

    // Usar las propiedades conocidas de TelaFiltroDTO para mantener el tipado correcto
    const propiedadesValidas: Array<keyof TelaFiltroDTO> = [
      'numGuia', 'proveedor', 'cliente', 'fechaInicio', 'fechaFin',
      'descripcion', 'os', 'partida', 'estado', 'almacen', 'tipoTela'
    ];

    // Copiar solo propiedades válidas y no vacías
    propiedadesValidas.forEach(prop => {
      if (filtrosForm[prop] !== '' && filtrosForm[prop] !== null && filtrosForm[prop] !== undefined) {
        filtros[prop] = filtrosForm[prop];
      }
    });

    // Verificar si hay al menos un filtro
    const hayFiltros = Object.keys(filtros).length > 0;

    if (hayFiltros) {
      // Generar reporte filtrado
      this.telaService.generarReporteFiltrado(filtros as TelaFiltroDTO, formato)
        .pipe(
          catchError(error => {
            this.toastr.error('Error al generar el reporte filtrado', 'Error');
            return of(null);
          }),
          finalize(() => this.cargandoReporte = false)
        )
        .subscribe(blob => {
          if (blob) {
            this.descargarBlob(blob, `reporte-telas-filtrado.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
            this.toastr.success('Reporte generado correctamente', 'Éxito');
          }
        });
    } else {
      // Descargar reporte completo con el nuevo método observable
      this.telaService.descargarReporte(formato)
        .pipe(
          catchError(error => {
            this.toastr.error('Error al generar el reporte', 'Error');
            return of(null);
          }),
          finalize(() => this.cargandoReporte = false)
        )
        .subscribe(() => {
          // No necesitamos manejar el blob aquí porque el tap() en descargarReporte() ya lo hace
          this.toastr.success('Reporte generado correctamente', 'Éxito');
        });
    }
  }

  /**
   * Descarga un blob como archivo
   */
  private descargarBlob(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.toastr.info('Filtros limpiados', 'Información');
  }


  cambiarFiltro(campo: keyof TelaFiltroDTO, valor: string): void {
    this.filtroForm.patchValue({ [campo]: valor });
  }

  manejarInput(event: Event, campo: keyof TelaFiltroDTO): void {
    const input = event.target as HTMLInputElement; // Añadimos type casting explícito
    this.filtroForm.patchValue({ [campo]: input.value });
  }

  renderizarGraficosDinamicamente(): void {
    // Limpiar el contenedor
    if (this.chartContainer && this.chartContainer.nativeElement) {
      this.chartContainer.nativeElement.innerHTML = '';

      // Crear un nuevo canvas
      const canvas = document.createElement('canvas');
      canvas.id = this.criterioSeleccionado + 'Chart';
      this.chartContainer.nativeElement.appendChild(canvas);

      // Renderizar el gráfico
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Código del gráfico...
      }
    }
  }

  /**
 * Calcula el total de una columna específica de las estadísticas
 * @param columna Nombre de la columna a totalizar
 * @returns La suma de los valores de la columna
 */
  calcularTotalColumna(columna: string): number {
    if (!this.estadisticas || this.estadisticas.length === 0) {
      return 0;
    }

    // Sumar todos los valores de la columna
    return this.estadisticas.reduce((total, item) => {
      // Convertir a número para asegurar una suma correcta (evita concatenaciones de strings)
      const valor = Number(item[columna]) || 0;
      return total + valor;
    }, 0);
  }
}