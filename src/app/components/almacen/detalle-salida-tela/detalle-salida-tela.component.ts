// src/app/features/inventarios/components/detalle-salida-tela/detalle-salida-tela.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { SalidaCorte } from '../../../interface/salida-corte.interface';
import { DialogService } from '../../../service/dialog.service';

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

  // Usuario actual (idealmente usar un servicio de autenticación)
  usuarioResponsable = 'SISTEMA';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salidaCorteService: SalidaCorteService,
    private movimientoTelaService: MovimientoTelaService,
    private fb: FormBuilder,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.salidaId = +idParam;
        this.cargarDetalleSalida();
      } else {
        this.router.navigate(['/inventarios/salidas']);
      }
    });

    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.consumoRealForm = this.fb.group({
      consumoReal: [null, [Validators.required, Validators.min(0.1)]],
      observacion: ['']
    });
  }

  cargarDetalleSalida(): void {
    this.loading = true;
    this.salidaCorteService.obtenerSalida(this.salidaId).subscribe({
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

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // El interceptor global manejará la notificación del error
        this.router.navigate(['/inventarios/salidas']);
      }
    });
  }

  toggleFormConsumo(): void {
    this.mostrarFormConsumo = !this.mostrarFormConsumo;
  }

  registrarConsumoReal(): void {
    if (this.consumoRealForm.invalid || this.loadingConsumo || !this.salida) {
      return;
    }

    this.loadingConsumo = true;
    const consumoDTO = {
      consumoReal: this.consumoRealForm.value.consumoReal,
      observacion: this.consumoRealForm.value.observacion,
      usuario: this.usuarioResponsable
    };

    this.salidaCorteService.registrarConsumoReal(this.salidaId, consumoDTO).subscribe({
      next: (result) => {
        this.loadingConsumo = false;
        this.mostrarFormConsumo = false;
        this.salida = result;
        this.consumoRealForm.reset();
        // Mostrar mensaje de éxito (puedes usar toastr si lo prefieres)
        alert('Consumo real registrado correctamente');
      },
      error: () => {
        this.loadingConsumo = false;
        // El interceptor global manejará la notificación del error
      }
    });
  }

  toggleConfirmacionAnular(): void {
    this.mostrarConfirmacionAnular = !this.mostrarConfirmacionAnular;
    if (!this.mostrarConfirmacionAnular) {
      this.motivo = '';
    }
  }

  anularSalida(): void {
    if (!this.motivo.trim() || this.loadingAnular || !this.salida) {
      if (!this.motivo.trim()) {
        alert('Debe ingresar un motivo para anular la salida');
      }
      return;
    }

    this.loadingAnular = true;
    const anularDTO = {
      motivo: this.motivo,
      usuario: this.usuarioResponsable
    };

    this.salidaCorteService.anularSalida(this.salidaId, anularDTO).subscribe({
      next: (result) => {
        this.loadingAnular = false;
        this.mostrarConfirmacionAnular = false;
        this.salida = result;
        this.motivo = '';
        // Mostrar mensaje de éxito
        alert('Salida anulada correctamente');
      },
      error: () => {
        this.loadingAnular = false;
        // El interceptor global manejará la notificación del error
      }
    });
  }

  verHistorialMovimientos(): void {
    if (!this.salida) return;

    // Usar el ID de la salida como documento de referencia
    this.router.navigate(['/inventarios/movimientos'], {
      queryParams: { documentoId: this.salidaId.toString() }
    });
  }

  volver(): void {
    this.router.navigate(['/inventarios/salidas']);
  }

  formatearFecha(fecha: any, formato: string = 'dd/MM/yyyy'): string {
    if (!fecha) return 'N/A';
    
    try {
      let fechaObj: Date;
      
      // Si la fecha ya es un array
      if (Array.isArray(fecha)) {
        if (fecha.length >= 6) {
          // Array completo [año, mes, día, hora, minuto, segundo]
          fechaObj = new Date(fecha[0], fecha[1]-1, fecha[2], fecha[3], fecha[4], fecha[5]);
        } else if (fecha.length >= 3) {
          // Solo fecha sin hora [año, mes, día]
          fechaObj = new Date(fecha[0], fecha[1]-1, fecha[2], 0, 0, 0);
        } else {
          throw new Error('Formato de array de fecha incorrecto');
        }
      } 
      // Si la fecha viene como string con formato "YYYY,M,D,H,M,S"
      else if (typeof fecha === 'string' && fecha.includes(',')) {
        const partes = fecha.split(',').map(Number);
        if (partes.length >= 6) {
          fechaObj = new Date(partes[0], partes[1]-1, partes[2], partes[3], partes[4], partes[5]);
        } else if (partes.length >= 3) {
          fechaObj = new Date(partes[0], partes[1]-1, partes[2], 0, 0, 0);
        } else {
          throw new Error('Formato de string de fecha incorrecto');
        }
      } 
      // Intentar parsear como fecha normal
      else {
        fechaObj = new Date(fecha);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida:', fecha);
        return 'Fecha inválida';
      }
      
      // Formatear la fecha manualmente para no depender del pipe
      const day = String(fechaObj.getDate()).padStart(2, '0');
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const year = fechaObj.getFullYear();
      
      if (formato.includes('HH:mm')) {
        const hours = String(fechaObj.getHours()).padStart(2, '0');
        const minutes = String(fechaObj.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      } else {
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
     //console.error('Error al formatear fecha:', fecha, e, 'Stack:', e.stack);
      return 'Fecha inválida';
    }
  }
}