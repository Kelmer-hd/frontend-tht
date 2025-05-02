import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlmacenService } from '../../../service/almancen.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlmacenCreateDTO } from '../../../interface/almacen.interface';

@Component({
  selector: 'app-alamacen-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alamacen-form.component.html',
})
export class AlamacenFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  almacenId!: number;

  constructor(
    private fb: FormBuilder,
    private almacenService: AlmacenService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializa el formulario con validaciones
    this.form = this.fb.group({
      codigoAlmacen: ['', [Validators.required]],  // Agregado para el código
      nombreAlmacen: ['', [Validators.required, Validators.minLength(3)]],
      abreviatura: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      tipoAlmacen: ['', Validators.required],
      estado: ['', Validators.required],
      local: ['', [Validators.required]]
    });
    

    // Verifica si el componente está en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.almacenId = +params['id'];
        this.almacenService.getById(this.almacenId).subscribe((data: AlmacenCreateDTO) => {
          this.form.patchValue(data); // Rellena el formulario con los datos
        });
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      return; // Si el formulario no es válido, no se envía
    }

    if (this.editMode) {
      // Actualiza el almacén
      this.almacenService.update(this.almacenId, this.form.value).subscribe(() => {
        this.router.navigate(['/inventarios/almacenes']);
      });
    } else {
      console.log('Payload enviado al backend:', this.form.value);
      // Crea un nuevo almacén
      this.almacenService.create(this.form.value).subscribe({
        next: () => this.router.navigate(['/inventarios/almacenes']),
        error: (err) => console.error('Error al crear el almacén:', err)
      });
      
    }
  }

  cancelar(): void{
    this.router.navigate(['/inventarios/almacenes'])
  }

  get codigoAlmacen() {
    return this.form.get('codigoAlmacen');
  }

  get nombreAlmacen() {
    return this.form.get('nombreAlmacen');
  }

  get abreviatura() {
    return this.form.get('abreviatura');
  }

  get descripcion() {
    return this.form.get('descripcion');
  }

  get direccion() {
    return this.form.get('direccion');
  }

  get tipoAlmacen() {
    return this.form.get('tipoAlmacen');
  }

  get estado() {
    return this.form.get('estado');
  }

  get local() {
    return this.form.get('local');
  }
}
