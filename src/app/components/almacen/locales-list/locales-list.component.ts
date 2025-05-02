import { Component } from '@angular/core';
import { Local } from '../../../interface/local.interface';
import { LocalService } from '../../../service/local.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-locales-list',
  imports: [CommonModule],
  templateUrl: './locales-list.component.html',
  styles: ``
})
export class LocalesListComponent {

    locales: Local[] = [];
    loading = false;
    error: string | null = null;
  
    constructor(private localService: LocalService) {}
  
    ngOnInit(): void {
      this.loadLocales();
    }
  
    loadLocales(): void {
      this.loading = true;
      this.error = null;
  
      this.localService.getLocales()
        .subscribe({
          next: (locales) => {
            this.locales = locales;
            this.loading = false;
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
    }
  
    deleteLocal(id: number): void {
      if (confirm('¿Está seguro de eliminar esta unidad de medida?')) {
        this.localService.deleteLocal(id)
          .subscribe({
            next: () => {
              this.locales = this.locales.filter(um => um.id !== id);
            },
            error: (error) => {
              this.error = error.message;
            }
          });
      }
    }

}
