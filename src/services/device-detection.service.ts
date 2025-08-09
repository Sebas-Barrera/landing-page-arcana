import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, fromEvent, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetectionService {
  private isMobileSubject = new BehaviorSubject<boolean>(this.checkIsMobile());
  public isMobile$ = this.isMobileSubject.asObservable();

  private readonly MOBILE_BREAKPOINT = 768; // px

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // CRÍTICO: Solo ejecutar en el browser
    if (isPlatformBrowser(this.platformId)) {
      // Verificación adicional de window para máxima seguridad
      if (typeof window !== 'undefined') {
        // Escuchar cambios de tamaño de ventana
        fromEvent(window, 'resize')
          .pipe(debounceTime(100), distinctUntilChanged())
          .subscribe(() => {
            this.updateMobileStatus();
          });

        // Verificación inicial después de un frame para asegurar que todo esté cargado
        setTimeout(() => {
          this.updateMobileStatus();
        }, 0);
      }
    }
  }

  private checkIsMobile(): boolean {
    // Verificar si estamos en el browser
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return false; // Default para SSR - siempre devolver false en servidor
    }

    try {
      // Verificar ancho de pantalla
      const screenWidth = window.innerWidth;
      const isSmallScreen = screenWidth < this.MOBILE_BREAKPOINT;

      // Verificar user agent para dispositivos móviles
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );

      // Verificar si es touch device
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const result = isSmallScreen || (isMobileUserAgent && isTouchDevice);

      return result;
    } catch (error) {
      console.error('Error en checkIsMobile:', error);
      return false; // Default seguro en caso de error
    }
  }

  private updateMobileStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const newStatus = this.checkIsMobile();
      const currentStatus = this.isMobileSubject.value;

      if (currentStatus !== newStatus) {
        this.isMobileSubject.next(newStatus);
      }
    } catch (error) {}
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  get isDesktop(): boolean {
    return !this.isMobile;
  }

  // Método para verificar orientación en móviles
  get isPortrait(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return true; // Default para SSR
    }

    try {
      return window.innerHeight > window.innerWidth;
    } catch (error) {
      console.error('Error en isPortrait:', error);
      return true;
    }
  }

  get isLandscape(): boolean {
    return !this.isPortrait;
  }

  // Método para verificar si es tablet
  get isTablet(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return false; // Default para SSR
    }

    try {
      const width = window.innerWidth;
      return width >= 768 && width <= 1024;
    } catch (error) {
      console.error('Error en isTablet:', error);
      return false;
    }
  }

  // Método para verificar el tipo de dispositivo
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobile && !this.isTablet) return 'mobile';
    if (this.isTablet) return 'tablet';
    return 'desktop';
  }

  // Método público para forzar re-detección (útil para debugging)
  forceDetection(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateMobileStatus();
    }
  }
}
