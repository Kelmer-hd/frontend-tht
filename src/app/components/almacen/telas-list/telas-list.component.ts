// src/app/components/almacen/telas-list/telas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TelaService } from '../../../service/tela.service';
import { Tela } from '../../../interface/tela.interface';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-telas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './telas-list.component.html',
  providers: [DatePipe]
})
export class TelaListComponent implements OnInit {
  telas: Tela[] = [];
  almacenId: number | null = null;
  filtroNumGuia: string = '';
  filtroProveedor: string = '';
  filtroCliente: string = '';
  loading: boolean = false;
  
  constructor(
    private telaService: TelaService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('almacenId');
      if (idParam) {
        this.almacenId = +idParam;
      }
      this.cargarTelas();
    });
  }
  
  cargarTelas(): void {
    this.loading = true;
    if (this.almacenId) {
      // Si tenemos un almacenId, cargamos las telas específicas de ese almacén
      this.telaService.getTelasDeAlmacen(this.almacenId).subscribe({
        next: (data) => {
          this.telas = data.map(item => item.tela);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar telas del almacén', error);
          this.loading = false;
        }
      });
    } else {
      // Si no, cargamos todas las telas
      this.telaService.getTelas().subscribe({
        next: (data) => {
          this.telas = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar telas', error);
          this.loading = false;
        }
      });
    }
  }
  
  
   
}