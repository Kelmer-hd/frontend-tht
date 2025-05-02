import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UnidadMedidaService } from '../../../service/unidad-medida.service';
import { UMDimensiones } from '../../../interface/unidad-medida.interface';

@Component({
  selector: 'app-unidad-medida-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './unidad-medida-form.component.html'
})
export class UnidadMedidaFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  unidadMedidaId: number | null = null;
  loading = false;
  error: string | null = null;
  dimensiones = Object.values(UMDimensiones);

  constructor(
    private fb: FormBuilder,
    private unidadMedidaService: UnidadMedidaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      dimension: ['', [Validators.required]],
      ingles: ['', [Validators.required]],
      abreviatura: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      aceptaRedondeoPorExceso: [false],
      factorRedondeo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.unidadMedidaId = +id;
      this.loadUnidadMedida();
    }
  }

  private loadUnidadMedida(): void {
    if (!this.unidadMedidaId) return;

    this.loading = true;
    this.unidadMedidaService.getUnidadMedidaById(this.unidadMedidaId)
      .subscribe({
        next: (unidadMedida) => {
          this.form.patchValue(unidadMedida);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.form.value;

    const operation = this.isEditMode && this.unidadMedidaId
      ? this.unidadMedidaService.updateUnidadMedida(this.unidadMedidaId, formValue)
      : this.unidadMedidaService.createUnidadMedida(formValue);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/inventarios/unidades-medida']);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['min']) return 'El valor mínimo es 0';
    }
    return '';
  }
}
