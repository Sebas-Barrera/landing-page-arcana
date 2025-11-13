import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  arcana: boolean;
  tier: string | null;
  subscription_status: string | null;
  platform: string | null;
  expires_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private supabase: SupabaseClient | null = null;

  constructor() {}

  /**
   * Inicializa el cliente de Supabase (lazy initialization)
   */
  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.key
      );
    }
    return this.supabase;
  }

  /**
   * Obtiene todos los usuarios registrados con su información de suscripción
   */
  async getUsers(): Promise<UserData[]> {
    try {
      const client = this.getSupabaseClient();

      // Primero, obtener todos los perfiles
      const { data: profiles, error: profileError } = await client
        .from('profile')
        .select('id, first_name, last_name, created_at, arcana, user_id')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      // Luego, obtener todas las suscripciones
      const { data: subscriptions, error: subsError } = await client
        .from('user_subscriptions')
        .select('user_id, tier, status, platform, expires_at');

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        throw subsError;
      }

      // Crear un mapa de suscripciones por user_id para búsqueda rápida
      const subscriptionMap = new Map();
      (subscriptions || []).forEach(sub => {
        subscriptionMap.set(sub.user_id, sub);
      });

      // Combinar los datos
      const usersWithSubscriptions: UserData[] = (profiles || []).map(profile => {
        const subscription = subscriptionMap.get(profile.user_id);

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: profile.created_at,
          arcana: profile.arcana,
          tier: subscription?.tier || null,
          subscription_status: subscription?.status || null,
          platform: subscription?.platform || null,
          expires_at: subscription?.expires_at || null,
        };
      });

      return usersWithSubscriptions;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales de usuarios
   */
  async getUserStats(): Promise<{
    total: number;
    withSubscription: number;
    arcanaMembers: number;
  }> {
    try {
      const users = await this.getUsers();

      return {
        total: users.length,
        withSubscription: users.filter(u => u.subscription_status === 'active').length,
        arcanaMembers: users.filter(u => u.arcana).length,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total: 0, withSubscription: 0, arcanaMembers: 0 };
    }
  }
}
