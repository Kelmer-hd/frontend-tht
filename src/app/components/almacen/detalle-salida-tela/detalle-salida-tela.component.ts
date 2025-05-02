// src/app/features/inventarios/components/detalle-salida-tela/detalle-salida-tela.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { SalidaCorte } from '../../../interface/salida-corte.interface';
import { DialogService } from '../../../service/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../service/auth.service';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-salida-tela',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './detalle-salida-tela.component.html'
})
export class DetalleSalidaTelaComponent implements OnInit {
  salidaId!: number;
  salida: SalidaCorte | null = null;
  loading = false;

  // Para registro de consumo real
  consumoRealForm!: FormGroup;
  mostrarFormConsumo = false;
  loadingConsumo = false;

  // Para anulación
  motivo = '';
  mostrarConfirmacionAnular = false;
  loadingAnular = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salidaCorteService: SalidaCorteService,
    private movimientoTelaService: MovimientoTelaService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.salidaId = +idParam;
        this.cargarDetalleSalida();
      } else {
        this.toastr.warning('ID de salida no proporcionado', 'Advertencia');
        this.router.navigate(['/inventarios/salidas']);
      }
    });

    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario de consumo real con validaciones básicas
   */
  inicializarFormulario(): void {
    this.consumoRealForm = this.fb.group({
      consumoReal: [null, [
        Validators.required,
        Validators.min(0.1)
      ]],
      observacion: ['', Validators.maxLength(200)]
    });
  }

  /**
   * Carga los detalles de la salida desde el servicio
   */
  cargarDetalleSalida(): void {
    this.loading = true;
    this.salidaCorteService.obtenerSalida(this.salidaId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.salida = data;

          // Actualizar validaciones del formulario de consumo real
          if (this.salida) {
            const consumoRealControl = this.consumoRealForm.get('consumoReal');
            if (consumoRealControl) {
              consumoRealControl.setValidators([
                Validators.required,
                Validators.min(0.1),
                Validators.max(this.salida.salidaCorte)
              ]);
              consumoRealControl.updateValueAndValidity();
            }
          }
        },
        error: () => {
          // El interceptor global manejará la notificación del error
          this.router.navigate(['/inventarios/salidas']);
        }
      });
  }

  /**
   * Muestra u oculta el formulario de consumo real
   */
  toggleFormConsumo(): void {
    this.mostrarFormConsumo = !this.mostrarFormConsumo;
    if (this.mostrarFormConsumo) {
      this.consumoRealForm.reset();
    }
  }

  /**
   * Obtiene el nombre de usuario actual del servicio de autenticación
   */
  private getUsuarioActual(): string {
    const user = this.authService.getCurrentUser();
    return user?.username || 'SISTEMA';
  }

  /**
   * Registra el consumo real de una salida
   */
  registrarConsumoReal(): void {
    if (this.consumoRealForm.invalid || this.loadingConsumo || !this.salida) {
      // Marcar campos como touched para mostrar errores
      if (this.consumoRealForm.invalid) {
        Object.keys(this.consumoRealForm.controls).forEach(key => {
          this.consumoRealForm.get(key)?.markAsTouched();
        });
        this.toastr.warning('Por favor complete correctamente todos los campos requeridos', 'Formulario inválido');
      }
      return;
    }

    this.loadingConsumo = true;
    const consumoDTO = {
      consumoReal: this.consumoRealForm.value.consumoReal,
      observacion: this.consumoRealForm.value.observacion || '',
      usuario: this.getUsuarioActual()
    };

    this.salidaCorteService.registrarConsumoReal(this.salidaId, consumoDTO)
      .pipe(
        finalize(() => this.loadingConsumo = false)
      )
      .subscribe({
        next: (result) => {
          this.mostrarFormConsumo = false;
          this.salida = result;
          this.consumoRealForm.reset();
          this.toastr.success('Consumo real registrado correctamente', 'Éxito');
        },
        error: () => {
          // El interceptor global manejará la notificación del error
        }
      });
  }

  /**
   * Muestra u oculta el formulario de anulación
   */
  toggleConfirmacionAnular(): void {
    this.mostrarConfirmacionAnular = !this.mostrarConfirmacionAnular;
    if (!this.mostrarConfirmacionAnular) {
      this.motivo = '';
    }
  }

  /**
   * Anula una salida existente
   */
  anularSalida(): void {
    if (!this.motivo.trim() || this.loadingAnular || !this.salida) {
      if (!this.motivo.trim()) {
        this.toastr.warning('Debe ingresar un motivo para anular la salida', 'Advertencia');
      }
      return;
    }

    this.loadingAnular = true;
    const anularDTO = {
      motivo: this.motivo,
      usuario: this.getUsuarioActual()
    };

    this.salidaCorteService.anularSalida(this.salidaId, anularDTO)
      .pipe(
        finalize(() => this.loadingAnular = false)
      )
      .subscribe({
        next: (result) => {
          this.mostrarConfirmacionAnular = false;
          this.salida = result;
          this.motivo = '';
          this.toastr.success('Salida anulada correctamente', 'Éxito');
        },
        error: () => {
          // El interceptor global manejará la notificación del error
        }
      });
  }

  /**
   * Navega a la pantalla de historial de movimientos
   */
  verHistorialMovimientos(): void {
    if (!this.salida) return;

    // Usar el ID de la salida como documento de referencia
    this.router.navigate(['/inventarios/movimientos'], {
      queryParams: { documentoId: this.salidaId.toString() }
    });
  }

  /**
   * Navega de vuelta a la lista de salidas
   */
  volver(): void {
    this.router.navigate(['/inventarios/salidas']);
  }

  /**
   * Formatea una fecha usando date-fns
   * @param fecha Fecha a formatear
   * @param formato Formato deseado
   */
  formatearFecha(fecha: any, formato: string = 'dd/MM/yyyy'): string {
    if (!fecha) return 'N/A';
    
    try {
      // Convertir a string si no lo es
      const fechaStr = typeof fecha === 'string' ? fecha : JSON.stringify(fecha);
      
      // Intentar parsear la fecha
      const fechaObj = parseISO(fechaStr);
      
      // Verificar si la fecha es válida
      if (isValid(fechaObj)) {
        return format(fechaObj, formato, { locale: es });
      }
      
      // Si no se pudo parsear, intentar con otras estrategias...
      if (Array.isArray(fecha)) {
        if (fecha.length >= 3) {
          const fechaObj = new Date(fecha[0], fecha[1]-1, fecha[2]);
          if (isValid(fechaObj)) {
            return format(fechaObj, formato, { locale: es });
          }
        }
      }
      
      return 'Fecha inválida';
    } catch (e) {
      console.error('Error al formatear fecha:', fecha, e);
      return 'Fecha inválida';
    }
  }
}