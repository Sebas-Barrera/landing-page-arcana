import { Injectable, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly ADMIN_EMAILS = [
    'ringclubsma@gmail.com',
    'arcana.circulomagico@gmail.com'
  ];

  // Contraseña hardcoded (puedes cambiarla)
  private readonly ADMIN_PASSWORD = 'ArcanaAdmin2025!';

  private readonly SESSION_KEY = 'arcana_admin_session';

  // Signal para el estado de autenticación
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentAdminEmail = signal<string | null>(null);

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.checkSession();
  }

  /**
   * Verifica si hay una sesión activa al iniciar el servicio
   */
  private checkSession(): void {
    if (this.isBrowser) {
      const session = sessionStorage.getItem(this.SESSION_KEY);
      if (session) {
        try {
          const data = JSON.parse(session);
          if (this.ADMIN_EMAILS.includes(data.email)) {
            this.isAuthenticated.set(true);
            this.currentAdminEmail.set(data.email);
          }
        } catch (error) {
          this.clearSession();
        }
      }
    }
  }

  /**
   * Intenta autenticar a un administrador
   */
  login(email: string, password: string): boolean {
    // Verificar que el email esté en la lista de admins
    if (!this.ADMIN_EMAILS.includes(email)) {
      return false;
    }

    // Verificar la contraseña
    if (password !== this.ADMIN_PASSWORD) {
      return false;
    }

    // Guardar sesión
    if (this.isBrowser) {
      const sessionData = {
        email,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }

    this.isAuthenticated.set(true);
    this.currentAdminEmail.set(email);

    return true;
  }

  /**
   * Cierra la sesión del administrador
   */
  logout(): void {
    this.clearSession();
    this.isAuthenticated.set(false);
    this.currentAdminEmail.set(null);
  }

  /**
   * Limpia la sesión del storage
   */
  private clearSession(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Verifica si el usuario actual está autenticado
   */
  isAdmin(): boolean {
    return this.isAuthenticated();
  }
}
