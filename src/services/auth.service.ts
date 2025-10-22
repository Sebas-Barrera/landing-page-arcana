import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'arcana_session';

  private isBrowser: boolean;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<{data: any, error: any}> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data?.session) {
        const authResponse: AuthResponse = {
          access_token: data.session.access_token,
          token_type: 'bearer',
          expires_in: data.session.expires_in || 3600,
          expires_at: data.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
          refresh_token: data.session.refresh_token,
          user: data.session.user,
        };

        await this.saveUserSession(authResponse);
        return { data: authResponse, error: null };
      }

      return { data: null, error: { message: 'No se pudo crear la sesión' } };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { data: null, error };
    }
  }

  /**
   * Guarda la sesión del usuario en localStorage
   */
  async saveUserSession(authResponse: AuthResponse): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(authResponse));
      console.log('✅ Sesión guardada exitosamente en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar sesión:', error);
    }
  }

  /**
   * Obtiene la sesión del usuario desde localStorage
   */
  getUserSession(): AuthResponse | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('❌ Error al recuperar sesión:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const session = this.getUserSession();
    if (!session) {
      return false;
    }

    // Verificar si la sesión ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (session.expires_at < currentTime) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();

      if (this.isBrowser) {
        localStorage.removeItem(this.SESSION_KEY);
      }

      this.router.navigate(['/login']);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    const session = this.getUserSession();
    return session?.user || null;
  }
}
