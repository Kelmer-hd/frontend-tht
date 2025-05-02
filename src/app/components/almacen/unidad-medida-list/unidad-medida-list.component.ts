import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UnidadMedida } from '../../../interface/unidad-medida.interface';
import { UnidadMedidaService } from '../../../service/unidad-medida.service';

@Component({
  selector: 'app-unidad-medida-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unidad-medida-list.component.html'
})
export class UnidadMedidaListComponent implements OnInit {
  unidadesMedidas: UnidadMedida[] = [];
  loading = false;
  error: string | null = null;

  constructor(private unidadMedidaService: UnidadMedidaService) {}

  ngOnInit(): void {
    this.loadUnidadesMedida();
  }

  loadUnidadesMedida(): void {
    this.loading = true;
    this.error = null;

    this.unidadMedidaService.getUnidadesMedida()
      .subscribe({
        next: (unidadesMedidas) => {
          this.unidadesMedidas = unidadesMedidas;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  deleteUnidadMedida(id: number): void {
    if (confirm('¿Está seguro de eliminar esta unidad de medida?')) {
      this.unidadMedidaService.deleteUnidadMedida(id)
        .subscribe({
          next: () => {
            this.unidadesMedidas = this.unidadesMedidas.filter(um => um.id !== id);
          },
          error: (error) => {
            this.error = error.message;
          }
        });
    }
  }
}