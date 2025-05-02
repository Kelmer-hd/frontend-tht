import { Component, OnInit, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TelaService } from '../../../service/tela.service';
import { TelaFiltroDTO } from '../../..//interface/tela.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './reportes.component.html',
  // styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private telaService = inject(TelaService);
  
  // Referencias para los gráficos
  @ViewChild('proveedoresChart') proveedoresChartRef!: ElementRef;
  @ViewChild('clientesChart') clientesChartRef!: ElementRef;
  @ViewChild('mensualesChart') mensualesChartRef!: ElementRef;
  @ViewChild('distribucionChart') distribucionChartRef!: ElementRef;
  
  // Instancias de los gráficos
  private proveedoresChart: Chart | null = null;
  private clientesChart: Chart | null = null;
  private mensualesChart: Chart | null = null;
  private distribucionChart: Chart | null = null;
  
  filtroForm: FormGroup;
  cargando = false;
  estadisticasProveedores: any[] = [];
  estadisticasClientes: any[] = [];
  estadisticasMensuales: any[] = [];
  anioSeleccionado: number = new Date().getFullYear();
  activeTab: string = 'reportes'; // Para controlar las pestañas

  // Colores para gráficos
  chartColors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 199, 199, 0.7)',
  ];

  constructor() {
    this.filtroForm = this.fb.group({
      numGuia: [''],
      partida: [''],
      os: [''],
      proveedor: [''],
      cliente: [''],
      descripcion: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    //this.cargarEstadisticas();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 500);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Renderizar gráficos cuando se cambia de pestaña, dando tiempo al DOM para actualizar
    setTimeout(() => {
      if (tab === 'proveedores' && this.estadisticasProveedores.length > 0) {
        this.crearGraficoProveedores();
      } else if (tab === 'clientes' && this.estadisticasClientes.length > 0) {
        this.crearGraficoClientes();
      } else if (tab === 'mensuales' && this.estadisticasMensuales.length > 0) {
        this.crearGraficoMensuales();
      } else if (tab === 'dashboard') {
        this.crearGraficoDashboard();
      }
    }, 300);
  }

  // cargarEstadisticas(): void {
  //   this.cargando = true;
    
  //   // Carga estadísticas por proveedor
  //   this.telaService.getEstadisticasPorProveedor().subscribe({
  //     next: (data) => {
  //       this.estadisticasProveedores = data;
  //       if (this.activeTab === 'proveedores' || this.activeTab === 'dashboard') {
  //         this.crearGraficoProveedores();
  //       }
  //       this.cargando = false;
  //     },
  //     error: (err) => {
  //       this.mostrarError('Error al cargar estadísticas de proveedores');
  //       console.error(err);
  //       this.cargando = false;
  //     }
  //   });

  //   // Carga estadísticas por cliente
  //   this.telaService.getEstadisticasPorCliente().subscribe({
  //     next: (data) => {
  //       this.estadisticasClientes = data;
  //       if (this.activeTab === 'clientes' || this.activeTab === 'dashboard') {
  //         this.crearGraficoClientes();
  //       }
  //     },
  //     error: (err) => {
  //       this.mostrarError('Error al cargar estadísticas de clientes');
  //       console.error(err);
  //     }
  //   });

  //   // Carga estadísticas mensuales
  //   this.cargarEstadisticasMensuales();
  // }

  cargarEstadisticasMensuales(): void {
    this.telaService.getEstadisticasMensuales(this.anioSeleccionado).subscribe({
      next: (data) => {
        this.estadisticasMensuales = data;
        if (this.activeTab === 'mensuales' || this.activeTab === 'dashboard') {
          this.crearGraficoMensuales();
        }
      },
      error: (err) => {
        this.mostrarError('Error al cargar estadísticas mensuales');
        console.error(err);
      }
    });
  }

  initCharts(): void {
    // Inicializar todos los gráficos basados en la pestaña activa
    if (this.activeTab === 'proveedores' && this.estadisticasProveedores.length > 0) {
      this.crearGraficoProveedores();
    } else if (this.activeTab === 'clientes' && this.estadisticasClientes.length > 0) {
      this.crearGraficoClientes();
    } else if (this.activeTab === 'mensuales' && this.estadisticasMensuales.length > 0) {
      this.crearGraficoMensuales();
    } else if (this.activeTab === 'dashboard') {
      this.crearGraficoDashboard();
    }
  }

  crearGraficoProveedores(): void {
    if (!this.proveedoresChartRef || this.estadisticasProveedores.length === 0) return;
    
    // Destruir el gráfico anterior si existe
    if (this.proveedoresChart) {
      this.proveedoresChart.destroy();
    }

    // Limitar a los 10 principales proveedores para mejor visualización
    const topProveedores = [...this.estadisticasProveedores]
      .sort((a, b) => b.totalPeso - a.totalPeso)
      .slice(0, 10);

    const ctx = this.proveedoresChartRef.nativeElement.getContext('2d');
    this.proveedoresChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProveedores.map(item => item.proveedor),
        datasets: [{
          label: 'Peso Total (kg)',
          data: topProveedores.map(item => item.totalPeso),
          backgroundColor: this.chartColors,
          borderColor: this.chartColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top 10 Proveedores por Peso Total',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Peso (kg)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Proveedores'
            }
          }
        }
      }
    });
  }

  crearGraficoClientes(): void {
    if (!this.clientesChartRef || this.estadisticasClientes.length === 0) return;
    
    // Destruir el gráfico anterior si existe
    if (this.clientesChart) {
      this.clientesChart.destroy();
    }

    // Limitar a los 10 principales clientes para mejor visualización
    const topClientes = [...this.estadisticasClientes]
      .sort((a, b) => b.cantidadTelas - a.cantidadTelas)
      .slice(0, 10);

    const ctx = this.clientesChartRef.nativeElement.getContext('2d');
    this.clientesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: topClientes.map(item => item.cliente),
        datasets: [{
          data: topClientes.map(item => item.cantidadTelas),
          backgroundColor: this.chartColors,
          borderColor: this.chartColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Distribución de Telas por Cliente',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  crearGraficoMensuales(): void {
    if (!this.mensualesChartRef || this.estadisticasMensuales.length === 0) return;
    
    // Destruir el gráfico anterior si existe
    if (this.mensualesChart) {
      this.mensualesChart.destroy();
    }

    // Ordenar los datos por número de mes para visualización correcta
    const datosMensuales = [...this.estadisticasMensuales]
      .sort((a, b) => a.mes - b.mes);

    const ctx = this.mensualesChartRef.nativeElement.getContext('2d');
    this.mensualesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datosMensuales.map(item => item.nombreMes),
        datasets: [
          {
            label: 'Cantidad de Telas',
            data: datosMensuales.map(item => item.cantidadTelas),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Peso Total (kg)',
            data: datosMensuales.map(item => item.totalPeso),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Estadísticas Mensuales - ${this.anioSeleccionado}`,
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Cantidad de Telas'
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Peso Total (kg)'
            }
          }
        }
      }
    });
  }

  crearGraficoDashboard(): void {
    if (!this.distribucionChartRef) return;
    
    // Destruir el gráfico anterior si existe
    if (this.distribucionChart) {
      this.distribucionChart.destroy();
    }

    // Crear un resumen de distribución de rollos por proveedor
    const totalRollos = this.getTotalRollosProveedores();
    const topProveedores = [...this.estadisticasProveedores]
      .sort((a, b) => b.totalRollos - a.totalRollos)
      .slice(0, 5);
    
    // Calcular "Otros" para simplificar el gráfico
    const otrosRollos = totalRollos - topProveedores.reduce((acc, curr) => acc + curr.totalRollos, 0);
    if (otrosRollos > 0) {
      topProveedores.push({
        proveedor: 'Otros',
        totalRollos: otrosRollos
      });
    }

    const ctx = this.distribucionChartRef.nativeElement.getContext('2d');
    this.distribucionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: topProveedores.map(item => item.proveedor),
        datasets: [{
          data: topProveedores.map(item => item.totalRollos),
          backgroundColor: this.chartColors,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Distribución de Rollos por Proveedor',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  cambiarAnio(anio: number): void {
    this.anioSeleccionado = anio;
    this.cargarEstadisticasMensuales();
  }

  // descargarReporteExcel(): void {
  //   this.telaService.descargarReporteExcel();
  //   this.mostrarExito('Descargando reporte Excel...');
  // }

  // descargarReportePDF(): void {
  //   this.telaService.descargarReportePDF();
  //   this.mostrarExito('Descargando reporte PDF...');
  // }

  // generarReporteFiltrado(): void {
  //   if (!this.esFormularioValido()) {
  //     this.mostrarError('Por favor, complete al menos un filtro');
  //     return;
  //   }

  //   const filtros: TelaFiltroDTO = this.obtenerFiltros();
    
  //   this.cargando = true;
  //   this.telaService.generarReporteExcelFiltrado(filtros).subscribe({
  //     next: (blob) => {
  //       this.cargando = false;
  //       this.descargarArchivo(blob, 'reporte-telas-filtrado.xlsx');
  //       this.mostrarExito('Reporte generado con éxito');
  //     },
  //     error: (err) => {
  //       this.cargando = false;
  //       this.mostrarError('Error al generar el reporte');
  //       console.error(err);
  //     }
  //   });
  // }

  private obtenerFiltros(): TelaFiltroDTO {
    const formValues = this.filtroForm.value;
    
    // Convertir fechas de formato DD/MM/YYYY a formato ISO YYYY-MM-DD
    let fechaInicio = formValues.fechaInicio ? this.formatearFecha(formValues.fechaInicio) : undefined;
    let fechaFin = formValues.fechaFin ? this.formatearFecha(formValues.fechaFin) : undefined;
    
    return {
      numGuia: formValues.numGuia || undefined,
      partida: formValues.partida || undefined,
      os: formValues.os || undefined,
      proveedor: formValues.proveedor || undefined,
      cliente: formValues.cliente || undefined,
      descripcion: formValues.descripcion || undefined,
      fechaInicio,
      fechaFin
    };
  }

  private formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  private esFormularioValido(): boolean {
    // Verifica si al menos un campo del formulario tiene un valor
    const values = this.filtroForm.value;
    return Object.keys(values).some(key => values[key] && values[key].trim && values[key].trim() !== '');
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  private mostrarExito(mensaje: string): void {
    // En una implementación real, podrías usar un servicio de notificación
    alert(mensaje);
  }

  private mostrarError(mensaje: string): void {
    // En una implementación real, podrías usar un servicio de notificación
    alert('Error: ' + mensaje);
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
  }

  // Métodos para calcular totales en las tablas
  getTotalTelasProveedores(): number {
    return this.estadisticasProveedores.reduce((acc, curr) => acc + curr.cantidadTelas, 0);
  }

  getTotalPesoProveedores(): number {
    return this.estadisticasProveedores.reduce((acc, curr) => acc + curr.totalPeso, 0);
  }

  getTotalRollosProveedores(): number {
    return this.estadisticasProveedores.reduce((acc, curr) => acc + curr.totalRollos, 0);
  }

  getTotalTelasClientes(): number {
    return this.estadisticasClientes.reduce((acc, curr) => acc + curr.cantidadTelas, 0);
  }

  getTotalPesoClientes(): number {
    return this.estadisticasClientes.reduce((acc, curr) => acc + curr.totalPeso, 0);
  }

  getTotalRollosClientes(): number {
    return this.estadisticasClientes.reduce((acc, curr) => acc + curr.totalRollos, 0);
  }

  getTotalTelasMensuales(): number {
    return this.estadisticasMensuales.reduce((acc, curr) => acc + curr.cantidadTelas, 0);
  }

  getTotalPesoMensuales(): number {
    return this.estadisticasMensuales.reduce((acc, curr) => acc + curr.totalPeso, 0);
  }

  getTotalRollosMensuales(): number {
    return this.estadisticasMensuales.reduce((acc, curr) => acc + curr.totalRollos, 0);
  }
}