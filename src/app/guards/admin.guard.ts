import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAdmin()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  router.navigate(['/admin']);
  return false;
};
