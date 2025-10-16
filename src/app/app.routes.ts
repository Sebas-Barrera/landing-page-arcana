import { Routes } from '@angular/router';
import { TerminosYCondicionesComponent } from './terminos-y-condiciones/terminos-y-condiciones.component';
import { SoporteComponent } from './soporte/soporte.component';
import { HomeComponent } from './home/home.component';
import { SuccesComponent } from './succes/succes.component';
import { CancelComponent } from './cancel/cancel.component';
import { MagiaComponent } from './magia/magia.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
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
    path: 'magia',
    component: MagiaComponent,
  },

  {
    path: '**',
    redirectTo: '',
  },
];
