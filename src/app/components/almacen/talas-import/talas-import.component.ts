// src/app/components/almacen/talas-import/talas-import.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TelaService } from '../../../service/tela.service';
import { AlmacenService } from '../../../service/almancen.service';
import { AlmacenDTO } from '../../../interface/almacen.interface';
import { ImportacionResultado } from '../../../interface/almacen-tela.interface';

@Component({
  selector: 'app-talas-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talas-import.component.html'
})
export class TelaImportComponent implements OnInit {
  almacenId!: number;
  almacen: AlmacenDTO | null = null;
  selectedFile: File | null = null;
  loading: boolean = false;
  resultado: ImportacionResultado | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private telaService: TelaService,
    private almacenService: AlmacenService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('almacenId');
      if (idParam) {
        this.almacenId = +idParam;
        this.cargarAlmacen();
      } else {
        alert('Se requiere un almacén para importar telas');
        this.router.navigate(['/inventarios/almacenes']);
      }
    });
  }
  
  cargarAlmacen(): void {
    this.almacenService.getById(this.almacenId).subscribe({
      next: (data) => {
        this.almacen = data;
      },
      error: (error) => {
        console.error('Error al cargar el almacén', error);
        alert('No se pudo cargar la información del almacén');
        this.router.navigate(['/inventarios/almacenes']);
      }
    });
  }
  
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }
  
  descargarPlantilla(): void {
    this.telaService.descargarPlantilla(this.almacenId);
  }
  
  importarArchivo(): void {
    if (!this.selectedFile) {
      alert('Por favor, seleccione un archivo para importar');
      return;
    }
    
    this.loading = true;
    this.resultado = null;
    
    this.telaService.importarTelasDesdeExcel(this.almacenId, this.selectedFile).subscribe({
      next: (result) => {
        this.resultado = result;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al importar el archivo', error);
        this.loading = false;
        alert('Ocurrió un error al importar el archivo');
      }
    });
  }
  
  volver(): void {
    this.router.navigate(['/inventarios/almacenes', this.almacenId, 'telas']);
  }
}