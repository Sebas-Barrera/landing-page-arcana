import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-magia',
  imports: [],
  templateUrl: './magia.component.html',
  styleUrl: './magia.component.scss',
})
export class MagiaComponent implements OnInit {
  private readonly isBrowser: boolean;
  private userIdParam: string | null = null;
  private supabase: any;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  
  ngOnInit(): void {
    // if (this.isBrowser) {
    //   this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
    //     auth: {
    //       persistSession: false,
    //       autoRefreshToken: false,
    //     },
    //   });
    // }
    // Leer parámetros de la ruta: userId y entorno/base
    const qp = this.route.snapshot.queryParamMap;
    this.userIdParam = qp.get('userId');
  }
  
  async handlePlanSelection (planId: string) {
    let tier: string = "";
    let stripeProductId: string = "";
    try {      
      switch (planId) {
        case 'basic':
          tier = 'basic';
          stripeProductId = 'prod_TCAsbdhM2M9BeK'; // Reemplazar con el ID real de Stripe
          break;
        case 'premium':
          tier = 'premium';
          stripeProductId = 'prod_TCAsCz9igJtuJF'; // Reemplazar con el ID real de Stripe
          break;
        case 'premium-annual':
          tier = 'premium';
          stripeProductId = 'prod_TCAsitjAyYQRLW'; // Reemplazar con el ID real de Stripe
          break;
        default:
          throw new Error(`Plan ID no reconocido: ${planId}`);
      }
      
      const userId = this.userIdParam ?? this.getUserId();
      console.log('🔍 [MagiaComponent] User ID obtenido:', userId);
      await this.createCheckoutSession(userId!, tier, stripeProductId);
      
    } catch (error) {
      console.error('❌ [SubscriptionScreen] Error al procesar plan:', error);
      alert('Error. No se pudo procesar la selección del plan. Por favor, inténtalo de nuevo.');
    }
  };

  // Crea la sesión de checkout en Stripe usando la función de Supabase
  async createCheckoutSession(userId: string | null, tier: string, stripeProductId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Crear el cliente de forma perezosa en caso de que no exista aún
      if (!this.supabase && this.isBrowser) {
        this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
          auth: {
            persistSession: true,
            autoRefreshToken: false,
          },
        });
      }

      if (!this.supabase) {
        throw new Error('Supabase client unavailable on server-side');
      }

      const { data, error } = await this.supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          tier,
          stripeProductId: stripeProductId,
          successUrl: `${environment.arcanaProdUrl}${environment.successUrl}`,
          cancelUrl: `${environment.arcanaProdUrl}${environment.cancelUrl}`,
        },
      });

      if (error) throw error;

      const checkoutUrl = (data as any)?.url ?? (data as any)?.data?.url;
      if (!checkoutUrl) {
        throw new Error('Missing checkout URL');
      }

      if (this.isBrowser) {
        window.open(checkoutUrl, '_self');
      }
    } catch (err) {
      console.error('❌ [MagiaComponent] Error creating checkout session:', err);
      if (this.isBrowser) {
        alert('No se pudo abrir la página de pago. Por favor, inténtalo de nuevo.');
      }
      throw new Error('Failed to create checkout session');
    }
  }

  // Helper para obtener el userId desde la sesión guardada por AuthService
  private getUserId(): string | null {
    if (!this.isBrowser) return null;

    // Leer la sesión completa guardada por AuthService
    const sessionData = localStorage.getItem('arcana_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.user?.id || null;
      } catch (error) {
        console.error('❌ Error al leer sesión de usuario:', error);
        return null;
      }
    }

    return null;
  }
}
