// src/app/features/inventarios/dialogs/salida-tela-dialog/salida-tela-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { Tela } from '../../../interface/tela.interface';
import { DialogRef } from '../../../service/dialog.service';

@Component({
  selector: 'app-salida-tela-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salida-tela-dialog.component.html'
})
export class SalidaTelaDialogComponent implements OnInit {
  salidaForm!: FormGroup;
  tela!: Tela;
  loading = false;
  todayDate = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
  usuarioResponsable = 'SISTEMA'; // Reemplazar con sistema de autenticación real
  
  // Estas propiedades serán asignadas por el DialogService
  public data: { tela: Tela } = { tela: {} as Tela };
  public dialogRef!: DialogRef;
  
  constructor(
    private fb: FormBuilder,
    private salidaCorteService: SalidaCorteService
  ) {}
  
  ngOnInit(): void {
    // Asignar la tela del data
    if (this.data && this.data.tela) {
      this.tela = this.data.tela;
      this.inicializarFormulario();
    } else {
      console.error('No se proporcionó información de tela');
      this.dialogRef?.close(false);
    }
  }
  
  inicializarFormulario(): void {
    this.salidaForm = this.fb.group({
      servicioCorte: ['', Validators.required],
      fechaSalida: [this.todayDate, Validators.required],
      notaSalida: ['', Validators.required],
      op: [this.tela.op || '', Validators.required],
      salidaCorte: [null, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(this.tela.stockReal)
      ]],
      areaDestino: ['CORTE', Validators.required]
    });
  }
  
  registrarSalida(): void {
    if (this.salidaForm.invalid || this.loading) {
      return;
    }
    
    this.loading = true;
    const salidaDTO = {
      telaId: this.tela.id,
      servicioCorte: this.salidaForm.value.servicioCorte,
      fechaSalida: this.salidaForm.value.fechaSalida,
      notaSalida: this.salidaForm.value.notaSalida,
      op: this.salidaForm.value.op,
      salidaCorte: this.salidaForm.value.salidaCorte,
      areaDestino: this.salidaForm.value.areaDestino,
      usuarioResponsable: this.usuarioResponsable
    };
    
    this.salidaCorteService.registrarSalida(salidaDTO).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        // Los errores ya son manejados por el interceptor global
        this.loading = false;
      }
    });
  }
}