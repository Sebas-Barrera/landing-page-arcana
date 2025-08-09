import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta raíz - muestra el AppComponent directamente
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./app.component').then((m) => m.AppComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
