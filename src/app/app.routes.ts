// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AlmacenDashboardComponent } from './components/almacen/almacen-dashboard/almacen-dashboard.component';
import { ListaAlmacenesComponent } from './components/almacen/alamacen-list/alamacen-list.component';
import { AlamacenFormComponent } from './components/almacen/alamacen-form/alamacen-form.component';
import { TelaImportComponent } from './components/almacen/talas-import/talas-import.component';
import { AlmacenDetailComponent } from './components/almacen/almacen-detail/almacen-detail.component';
import { TelaListComponent } from './components/almacen/telas-list/telas-list.component';
import { UnidadMedidaListComponent } from './components/almacen/unidad-medida-list/unidad-medida-list.component';
import { UnidadMedidaFormComponent } from './components/almacen/unidad-medida-form/unidad-medida-form.component';
import { LocalesListComponent } from './components/almacen/locales-list/locales-list.component';
import { ReportesComponent } from './components/almacen/reportes/reportes.component';
import { HistorialSalidasComponent } from './components/almacen/historial-salida/historial-salida.component';
import { DetalleSalidaTelaComponent } from './components/almacen/detalle-salida-tela/detalle-salida-tela.component';
import { ComprasDashboardComponent } from './components/compras/compras-dashboard/compras-dashboard.component';
import { ComprasListComponent } from './components/compras/compras-list/compras-list.component';
import { ProduccionDashboardComponent } from './components/produccion/produccion-dashboard/produccion-dashboard.component';
import { ProduccionListComponent } from './components/produccion/produccion-list/produccion-list.component';
import { authGuard } from './guards/auth.guard';
import { TelaFormComponent } from './components/almacen/tela-form/tela-form.component';

export const routes: Routes = [
  // Ruta de autenticación
  {
    path: 'login',
    component: LoginComponent
  },
  
  // Rutas protegidas que requieren autenticación
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'inventarios',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: AlmacenDashboardComponent },

          // Rutas para Almacenes
          { path: 'almacenes', component: ListaAlmacenesComponent },
          { path: 'almacenes/nuevo', component: AlamacenFormComponent },
          { path: 'almacenes/editar/:id', component: AlamacenFormComponent },
          { path: 'almacenes/:almacenId/telas/importar', component: TelaImportComponent },
          { path: 'almacenes/detalle/:id', component: AlmacenDetailComponent },
          { path: 'almacenes/:almacenId/telas', component: TelaListComponent }, 
          { path: 'telas/nuevo', component: TelaFormComponent },
          { path: 'telas/:id/editar', component: TelaFormComponent },

          // Rutas para Unidades de Medida
          { path: 'unidades-medida', component: UnidadMedidaListComponent },
          { path: 'unidades-medida/crear', component: UnidadMedidaFormComponent },
          { path: 'unidades-medida/editar/:id', component: UnidadMedidaFormComponent },

          // Rutas para Locales
          { path: 'locales', component: LocalesListComponent },

          {
            path: 'reportes', component: ReportesComponent
          },

          { 
            path: 'salidas', 
            component: HistorialSalidasComponent 
          },
          { 
            path: 'salidas/:id', 
            component: DetalleSalidaTelaComponent 
          },
        ]
      },
      {
        path: 'compras',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: ComprasDashboardComponent },
          { path: 'lista', component: ComprasListComponent },
        ]
      },
      {
        path: 'produccion',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: ProduccionDashboardComponent },
          { path: 'lista', component: ProduccionListComponent },
        ]
      }
    ]
  },
  
  // Redirección para rutas no encontradas - Envía a login si no hay autenticación
  { path: '**', redirectTo: 'login' }
];