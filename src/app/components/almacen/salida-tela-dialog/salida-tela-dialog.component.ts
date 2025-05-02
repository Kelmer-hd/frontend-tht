// src/app/features/inventarios/dialogs/salida-tela-dialog/salida-tela-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalidaCorteService } from '../../../service/salida-corte.service';
import { Tela } from '../../../interface/tela.interface';
import { DialogRef } from '../../../service/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';

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
 
  // Estas propiedades serán asignadas por el DialogService
  public data: { tela: Tela } = { tela: {} as Tela };
  public dialogRef!: DialogRef;
 
  constructor(
    private fb: FormBuilder,
    private salidaCorteService: SalidaCorteService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
 
  ngOnInit(): void {
    // Asignar la tela del data
    if (this.data && this.data.tela) {
      this.tela = this.data.tela;
      this.inicializarFormulario();
    } else {
      console.error('No se proporcionó información de tela');
      this.toastr.error('No se pudo cargar la información de la tela', 'Error');
      this.dialogRef?.close(false);
    }
  }
 
  inicializarFormulario(): void {
    this.salidaForm = this.fb.group({
      servicioCorte: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      fechaSalida: [this.todayDate, Validators.required],
      notaSalida: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      op: [this.tela.op || '', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      salidaCorte: [null, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(this.tela.stockReal)
      ]],
      areaDestino: ['CORTE', Validators.required]
    });
  }
 
  /**
   * Obtiene el nombre de usuario actual del servicio de autenticación
   */
  private getUsuarioActual(): string {
    const user = this.authService.getCurrentUser();
    return user?.username || 'SISTEMA';
  }
  
  /**
   * Registra una nueva salida de tela
   * Utiliza el interceptor global para el manejo de errores HTTP
   */
  registrarSalida(): void {
    // Verificar validez del formulario
    if (this.salidaForm.invalid) {
      // Marcar todos los controles como touched para mostrar errores
      Object.keys(this.salidaForm.controls).forEach(key => {
        const control = this.salidaForm.get(key);
        control?.markAsTouched();
      });
      this.toastr.warning('Por favor complete correctamente todos los campos requeridos', 'Formulario inválido');
      return;
    }

    if (this.loading) {
      return; // Evitar múltiples envíos
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
      usuarioResponsable: this.getUsuarioActual() // Obtener usuario actual autenticado
    };
   
    this.salidaCorteService.registrarSalida(salidaDTO).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastr.success(`Salida de ${salidaDTO.salidaCorte} kg registrada exitosamente`, 'Éxito');
        this.dialogRef.close(true); // Cerrar con éxito para refrescar la lista
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        
        // El error general ya es manejado por el interceptor global
        // Aquí solo se maneja lógica específica del componente
        
        // Manejar errores específicos del formulario si es necesario
        if (error.status === 400 && error.error?.errors) {
          const errors = error.error.errors;
          
          // Actualizar validadores si hay errores específicos de campos
          if (errors.salidaCorte) {
            this.salidaForm.get('salidaCorte')?.setErrors({ 'serverError': errors.salidaCorte });
          }
          
          // Otros campos pueden tener errores específicos
          Object.keys(errors).forEach(field => {
            if (this.salidaForm.get(field)) {
              this.salidaForm.get(field)?.setErrors({ 'serverError': errors[field] });
            }
          });
        }
      }
    });
  }
}