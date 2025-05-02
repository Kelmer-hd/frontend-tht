// src/app/components/layout/layout.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class LayoutComponent {
  activeSubmenu: string = '';
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('/inventarios')) {
          this.activeSubmenu = 'inventarios';
        } else if (event.url.includes('/compras')) {
          this.activeSubmenu = 'compras';
        } else if (event.url.includes('/produccion')) {
          this.activeSubmenu = 'produccion';
        } else {
          this.activeSubmenu = '';
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Obtiene el usuario actual para mostrar en el header
  get currentUser() {
    return this.authService.getCurrentUser();
  }
}