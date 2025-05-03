import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TelaService } from '../../../service/tela.service';
import { TelaCreateDTO, Tela } from '../../../interface/tela.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { finalize, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-tela-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tela-form.component.html',
})
export class TelaFormComponent implements OnInit {
  // Services
  private fb = inject(FormBuilder);
  private telaService = inject(TelaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  
  // Properties
  telaForm!: FormGroup;
  isEditing: boolean = false;
  telaId: number | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  
  // Lists for dropdowns
  proveedores: string[] = [];
  clientes: string[] = [];
  tiposTela: string[] = [];
  estados: string[] = ['Activo', 'Inactivo', 'Pendiente'];
  almacenes: string[] = [];
  
  ngOnInit(): void {
    this.createForm();
    this.loadTelaIfEditing();
    this.loadDropdownOptions();
  }
  
  /**
   * Crea el formulario de tela
   */
  createForm(): void {
    this.telaForm = this.fb.group({
      numGuia: ['', Validators.required],
      partida: ['', Validators.required],
      os: [''],
      proveedor: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      cliente: ['', Validators.required],
      marca: [''],
      op: [''],
      tipoTela: ['', Validators.required],
      descripcion: [''],
      ench: [''],
      cantRolloIngresado: [0, [Validators.required, Validators.min(0)]],
      pesoIngresado: [0, [Validators.required, Validators.min(0)]],
      stockReal: [0, [Validators.required, Validators.min(0)]],
      estado: ['Activo', Validators.required],
      almacen: ['', Validators.required]
    });
  }
  
  /**
   * Carga la tela a editar si estamos en modo edición
   */
  loadTelaIfEditing(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditing = true;
      this.telaId = parseInt(id);
      this.isLoading = true;
      
      this.telaService.getTelaById(this.telaId)
        .pipe(
          catchError(error => {
            this.toastr.error(`Error al cargar la tela: ${error.message || 'Error desconocido'}`, 'Error');
            this.router.navigate(['/telas']);
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(tela => {
          if (tela) {
            // Formatear fecha para el control input type="date"
            const fechaIngreso = tela.fechaIngreso ? 
              new Date(tela.fechaIngreso).toISOString().split('T')[0] : '';
              
            this.telaForm.patchValue({
              ...tela,
              fechaIngreso
            });
          }
        });
    }
  }
  
  /**
   * Carga las opciones para los dropdowns
   * (Puedes implementar esto con datos reales de tu API)
   */
  loadDropdownOptions(): void {
    // Aquí podrías cargar opciones reales desde tu API
    // Por ejemplo:
    // this.telaService.getProveedores().subscribe(data => this.proveedores = data);
    
    // Datos de ejemplo
    this.proveedores = ['Proveedor A', 'Proveedor B', 'Proveedor C'];
    this.clientes = ['Cliente X', 'Cliente Y', 'Cliente Z'];
    this.tiposTela = ['JER', 'RIB', 'FRA', 'GAM', 'PUÑ', 'PIQ', 'CUE', 'FRE'];
    this.almacenes = ['THT', 'Heawok'];
  }
  
  /**
   * Guarda la tela (creación o actualización)
   */
  saveTela(): void {
    if (this.telaForm.invalid) {
      this.markFormGroupTouched(this.telaForm);
      this.toastr.warning('Por favor, complete todos los campos requeridos', 'Formulario Incompleto');
      return;
    }
    
    this.isSaving = true;
    const telaData: TelaCreateDTO = this.telaForm.value;
    
    // Función para mostrar éxito y navegar
    const handleSuccess = () => {
      this.toastr.success(
        `Tela ${this.isEditing ? 'actualizada' : 'creada'} correctamente`, 
        'Éxito'
      );
      this.router.navigate(['/telas']);
    };
    
    // Función para manejar errores
    const handleError = (error: any) => {
      this.toastr.error(
        `Error al ${this.isEditing ? 'actualizar' : 'crear'} la tela: ${error.message || 'Error desconocido'}`, 
        'Error'
      );
      return of(null);
    };
    
    if (this.isEditing && this.telaId) {
      this.telaService.updateTela(this.telaId, telaData)
        .pipe(
          catchError(handleError),
          finalize(() => this.isSaving = false)
        )
        .subscribe(response => {
          if (response) handleSuccess();
        });
    } else {
      this.telaService.createTela(telaData)
        .pipe(
          catchError(handleError),
          finalize(() => this.isSaving = false)
        )
        .subscribe(response => {
          if (response) handleSuccess();
        });
    }
  }
  
  /**
   * Marca todos los controles del formulario como touched para mostrar validaciones
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  /**
   * Verifica si un control tiene errores y ha sido tocado
   */
  hasError(controlName: string): boolean {
    const control = this.telaForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  /**
   * Verifica si un control tiene un error específico
   */
  hasErrorType(controlName: string, errorType: string): boolean {
    const control = this.telaForm.get(controlName);
    return !!control && control.hasError(errorType) && (control.dirty || control.touched);
  }
  
  /**
   * Cancela la operación y vuelve a la lista de telas
   */
  cancel(): void {
    this.router.navigate(['/telas']);
  }
}