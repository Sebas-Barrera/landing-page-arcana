import { Routes } from '@angular/router';
import { TerminosYCondicionesComponent } from './terminos-y-condiciones/terminos-y-condiciones.component';
import { PoliticaDePrivacidadComponent } from './politica-de-privacidad/politica-de-privacidad.component';
import { SoporteComponent } from './soporte/soporte.component';
import { HomeComponent } from './home/home.component';
import { SuccesComponent } from './succes/succes.component';
import { CancelComponent } from './cancel/cancel.component';
import { MagiaComponent } from './magia/magia.component';
import { LoginComponent } from './login/login.component';
import { LoginComponent as AdminLoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ContentManagerComponent } from './admin/content-manager/content-manager.component';
import { adminGuard } from './guards/admin.guard';

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
    path: 'politica-de-privacidad',
    component: PoliticaDePrivacidadComponent,
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
    path: 'membresias',
    component: MagiaComponent,
  },
  {
    path: 'magia',
    component: LoginComponent,
  },
  {
    path: 'reset-password',
    component: HomeComponent,
  },
  {
    path: 'admin',
    component: AdminLoginComponent,
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/content-manager',
    component: ContentManagerComponent,
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
