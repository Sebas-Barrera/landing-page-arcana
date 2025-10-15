import { Routes } from '@angular/router';
import { TerminosYCondicionesComponent } from './terminos-y-condiciones/terminos-y-condiciones.component';
import { SoporteComponent } from './soporte/soporte.component';
import { HomeComponent } from './home/home.component';
import { SuccesComponent } from './succes/succes.component';
import { CancelComponent } from './cancel/cancel.component';

export const routes: Routes = [
  // Ruta raíz - muestra el HomeComponent
  {
    path: '',
    component: HomeComponent,
  },
  // Nuevas rutas
  {
    path: 'terminos-y-condiciones',
    component: TerminosYCondicionesComponent,
  },
  {
    path: 'soporte',
    component: SoporteComponent,
  },
  {
    path: 'payment/success',
    component: SuccesComponent,
  },
  {
    path: 'payment/cancel',
    component: CancelComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
