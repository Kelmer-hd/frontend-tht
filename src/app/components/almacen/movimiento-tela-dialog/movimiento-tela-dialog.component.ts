// src/app/features/inventarios/dialogs/movimiento-tela-dialog/movimiento-tela-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MovimientoTelaService } from '../../../service/movimiento-tela.service';
import { Tela } from '../../../interface/tela.interface';

@Component({
  selector: 'app-movimiento-tela-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimiento-tela-dialog.component.html'
})
export class MovimientoTelaDialogComponent implements OnInit {
  movimientoForm!: FormGroup;
  tela!: Tela;
  loading = false;
  todayDate = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
  usuarioResponsable = 'SISTEMA'; // Reemplazar con sistema de autenticación real
  public data: { tela: Tela, areaOrigen: string };
  public dialogRef: any;

  // Opciones para los selects
  tiposMovimiento = [
    { valor: 'ENTRADA', texto: 'Entrada' },
    { valor: 'SALIDA', texto: 'Salida' },
    { valor: 'TRANSFERENCIA', texto: 'Transferencia Interna' },
    { valor: 'AJUSTE', texto: 'Ajuste de Inventario' }
  ];

  areasDisponibles = [
    { valor: 'ALMACEN_PRINCIPAL', texto: 'Almacén Principal' },
    { valor: 'CORTE', texto: 'Área de Corte' },
    { valor: 'CONFECCION', texto: 'Área de Confección' },
    { valor: 'ACABADO', texto: 'Área de Acabado' },
    { valor: 'CONTROL_CALIDAD', texto: 'Control de Calidad' },
    { valor: 'DESPACHO', texto: 'Despacho' }
  ];

  constructor(
    private fb: FormBuilder,
    private movimientoTelaService: MovimientoTelaService
  ) {
    // No declarar data y dialogRef como parámetros del constructor
    this.data = { tela: {} as Tela, areaOrigen: '' };
    this.dialogRef = null;
  }

  ngOnInit(): void {
    this.tela = this.data.tela;
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.movimientoForm = this.fb.group({
      tipoMovimiento: ['TRANSFERENCIA', Validators.required],
      areaOrigen: [this.data.areaOrigen || 'ALMACEN_PRINCIPAL', Validators.required],
      areaDestino: ['', Validators.required],
      cantidad: [null, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(this.tela.stockReal)
      ]],
      referenciaDocumento: [''],
      observaciones: ['']
    });
  }

  registrarMovimiento(): void {
    if (this.movimientoForm.invalid || this.loading) {
      return;
    }

    this.loading = true;

    const movimientoDTO = {
      telaId: this.tela.id,
      areaOrigen: this.movimientoForm.value.areaOrigen,
      areaDestino: this.movimientoForm.value.areaDestino,
      cantidad: this.movimientoForm.value.cantidad,
      tipoMovimiento: this.movimientoForm.value.tipoMovimiento,
      referenciaDocumento: this.movimientoForm.value.referenciaDocumento || null,
      usuarioResponsable: this.usuarioResponsable,
      observaciones: this.movimientoForm.value.observaciones || null
    };

    this.movimientoTelaService.registrarMovimiento(movimientoDTO).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al registrar movimiento de tela', error);
        this.loading = false;

        // Manejar diferentes tipos de errores
        let mensajeError = 'No se pudo registrar el movimiento';
        if (error.status === 400) {
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else {
            mensajeError = 'La cantidad a mover excede el disponible o datos incorrectos';
          }
        }
        alert(mensajeError);
      }
    });
  }
}
