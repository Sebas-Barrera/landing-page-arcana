import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DeviceDetectionService } from '../services/device-detection.service';
import { FormsModule } from '@angular/forms';

// ========================================
// INTERFACES
// ========================================

export interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
}

export interface Testimonial {
  name: string;
  text: string;
  stars: number;
  specialty: string;
}

export interface TrustIndicators {
  members: string;
  rating: string;
}

export interface PricingInfo {
  amount: string;
  period: string;
  trial: string;
  cancellation: string;
}

export interface WelcomeData {
  title: string;
  description: string;
}

export interface FinalCTA {
  description: string;
  buttonText: string;
  disclaimer: string;
}

export interface StarConfig {
  top: number;
  left: number;
  delay: number;
}

// Interface simplificada para countdown
export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // ========================================
  // PROPIEDADES PÚBLICAS - ESTADO
  // ========================================

  readonly activeService = signal<string>('tarot');
  readonly currentTestimonial = signal<number>(0);
  isMobile: boolean = false;
  readonly showMembershipModal = signal<boolean>(false);
  readonly showNotification = signal<boolean>(false);
  readonly notificationData = signal<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    icon: string;
  }>({
    type: 'success',
    title: '',
    message: '',
    icon: '',
  });

  private notificationTimeout?: ReturnType<typeof setTimeout>;

  readonly membershipPlans = signal([
    {
      id: 'gratuita',
      name: 'Gratuita',
      price: '$0',
      period: '/mes',
      description:
        'Acceso limitado a contenido gratuito, mensajes y rituales básicos',
      features: [
        'Contenido gratuito limitado',
        'Mensajes básicos',
        'Rituales básicos',
      ],
      buttonText: 'Próximamente',
      popular: false,
      color: 'border-gray-400',
    },
    {
      id: 'basica',
      name: 'Básica',
      price: '$199',
      period: '/mes',
      description:
        'Todo lo de Gratuita + Significado de cristales, hierbas y flores + Fases lunares',
      features: [
        'Todo lo de Gratuita',
        'Significado de cristales',
        'Significado de hierbas y flores',
        'Fases lunares',
        'Artículos especializados',
      ],
      buttonText: 'Próximamente',
      popular: false,
      color: 'border-purple-400',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$399',
      period: '/año',
      description:
        'Todo lo de Gratuita + Significado de cristales, hierbas y flores + Fases lunares',
      features: [
        'Todo lo de Gratuita',
        'Significado de cristales, hierbas y flores',
        'Fases lunares completas',
      ],
      buttonText: 'Próximamente',
      popular: true,
      color: 'border-yellow-400',
    },
    {
      id: 'vip-mensual',
      name: 'VIP Mensual',
      price: '$599',
      period: '/mes',
      description:
        'Todo el contenido Premium y VIP + 1 lectura personalizada básica al mes + Acceso a cursos y dinámicas VIP',
      features: [
        'Todo el contenido Premium y VIP',
        '1 lectura personalizada al mes (1 pregunta con nuestro equipo mágico)',
        'Acceso a cursos VIP',
        'Dinámicas VIP exclusivas',
        'Regalo de bienvenida',
      ],
      buttonText: 'Próximamente',
      popular: false,
      color: 'border-gold',
    },
    {
      id: 'vip-anual',
      name: 'VIP Anual',
      price: '$5,988',
      period: '/año',
      subtitle: '(12 MSI)',
      description:
        'Acceso a todo el contenido Premium y VIP + 5 consultorías energéticas en el año + Acceso a cursos y dinámicas VIP',
      features: [
        'Acceso a todo el contenido Premium y VIP',
        '5 consultorías energéticas en el año',
        'Acceso a cursos y dinámicas VIP',
        'Asesoría personalizada',
        'Regalo de bienvenida especial',
      ],
      buttonText: 'Próximamente',
      popular: false,
      color: 'border-gold',
    },
  ]);

  // ========================================
  // PROPIEDADES PÚBLICAS - CONFIGURACIÓN VISUAL
  // ========================================

  readonly largeStars: StarConfig[] = [
    { top: 5, left: 15, delay: 0 },
    { top: 12, left: 85, delay: 1 },
    { top: 25, left: 8, delay: 2 },
    { top: 35, left: 92, delay: 1.5 },
    { top: 55, left: 12, delay: 3 },
    { top: 70, left: 88, delay: 2.5 },
    { top: 85, left: 20, delay: 1.8 },
    { top: 95, left: 75, delay: 0.7 },
  ];

  readonly mediumStars: StarConfig[] = this.generateRandomStars(60, 0.5, 3.5);
  readonly smallStars: StarConfig[] = this.generateRandomStars(40, 0.2, 2.8);
  readonly sparkles: StarConfig[] = this.generateRandomStars(30, 0.1, 4.0);
  readonly floatingSparkles: StarConfig[] = this.generateRandomStars(
    20,
    0.3,
    3.2
  );

  // ========================================
  // PROPIEDADES PÚBLICAS - DATOS DE LA APLICACIÓN
  // ========================================

  readonly services = signal<Service[]>([
    {
      id: 'tarot',
      name: 'Tarot y Arcanos',
      icon: 'fas fa-eye',
      description: 'Lecturas personalizadas que revelan tu destino',
      features: [
        'Lecturas personalizadas diarias',
        'Interpretación de arcanos mayores y menores',
        'Spreads especializados para diferentes temas',
        'Consultas en vivo con tarotistas certificados',
        'Curso completo de lectura de tarot',
      ],
    },
    {
      id: 'astrology',
      name: 'Astrología Avanzada',
      icon: 'fas fa-star-and-crescent',
      description: 'Cartas astrales y predicciones cósmicas',
      features: [
        'Carta astral personalizada completa',
        'Predicciones basadas en tránsitos planetarios',
        'Compatibilidad astrológica',
        'Análisis de retorno solar anual',
        'Astrología predictiva y evolutiva',
      ],
    },
    {
      id: 'holistic',
      name: 'Terapias Holísticas',
      icon: 'fas fa-spa',
      description: 'Chakras, frecuencias y sanación energética',
      features: [
        'Equilibrio y sanación de chakras',
        'Terapias con frecuencias sonoras',
        'Meditaciones guiadas especializadas',
        'Trabajo con cristales y gemas',
        'Técnicas de reiki y sanación energética',
      ],
    },
    {
      id: 'lunar',
      name: 'Ciclos Lunares',
      icon: 'fas fa-moon',
      description: 'Rituales y ceremonias según las fases lunares',
      features: [
        'Calendario lunar personalizado',
        'Rituales para cada fase lunar',
        'Ceremonias de luna llena y nueva',
        'Manifestación lunar guiada',
        'Conexión con ciclos naturales',
      ],
    },
  ]);

  readonly testimonials = signal<Testimonial[]>([
    {
      name: 'María Elena',
      text: 'Arcana cambió mi vida. Las lecturas son increíblemente precisas y el contenido premium vale cada centavo.',
      stars: 5,
      specialty: 'Tarot y Numerología',
    },
    {
      name: 'Carlos Mendoza',
      text: 'La comunidad es increíble y los cursos en vivo me han ayudado a desarrollar mis habilidades intuitivas.',
      stars: 5,
      specialty: 'Astrología y Chakras',
    },
    {
      name: 'Ana Sofía',
      text: 'Los rituales lunares y las meditaciones guiadas son exactamente lo que necesitaba para mi crecimiento espiritual.',
      stars: 5,
      specialty: 'Ceremonias Lunares',
    },
  ]);

  readonly trustIndicators = signal<TrustIndicators>({
    members: '10,000',
    rating: '4.9',
  });

  readonly premiumBenefits = signal<string[]>([
    'Todo el contenido Premium y VIP',
    '1 lectura al mes (1 pregunta con nuestro equipo mágico)',
    'Acceso a cursos VIP',
    'Dinámicas VIP exclusivas',
    'Regalo de bienvenida',
  ]);

  readonly pricing = signal<PricingInfo>({
    amount: '$599.99',
    period: '/mes',
    trial: '7 días gratis',
    cancellation: 'Cancela cuando quieras',
  });

  readonly welcomeData = signal<WelcomeData>({
    title: 'Despierta tu sabiduría interior',
    description:
      'Únete a miles de personas que han transformado sus vidas a través del tarot, astrología, terapias holísticas y rituales lunares. Tu despertar espiritual comienza aquí.',
  });

  readonly finalCTA = signal<FinalCTA>({
    description:
      'Únete a miles de personas que ya han transformado sus vidas con Arcana. Comienza tu viaje místico hoy mismo.',
    buttonText: 'Comenzar Mi Transformación',
    disclaimer: '✨ 7 días gratis • Sin compromiso • Cancela cuando quieras',
  });

  // ========================================
  // NUEVA PROPIEDAD PARA COUNTDOWN Y FORMULARIO
  // ========================================

  readonly countdown = signal<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Propiedades para el formulario de early access
  readonly showEarlyAccessForm = signal<boolean>(false);
  earlyAccessEmail: string = '';
  readonly formSubmitted = signal<boolean>(false);

  // ========================================
  // PROPIEDADES PRIVADAS
  // ========================================

  private readonly isBrowser: boolean;
  private readonly destroy$ = new Subject<void>();
  private testimonialInterval?: ReturnType<typeof setInterval>;
  private countdownInterval?: ReturnType<typeof setInterval>;

  // ========================================
  // CONSTRUCTOR
  // ========================================

  constructor(
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private deviceService: DeviceDetectionService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================

  ngOnInit(): void {
    if (this.isBrowser) {
      this.startTestimonialRotation();
      this.startCountdown();

      this.deviceService.isMobile$.subscribe((isMobile) => {
        this.isMobile = isMobile;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // ========================================
  // GESTIÓN DE SERVICIOS
  // ========================================

  setActiveService(serviceId: string): void {
    const service = this.services().find((s) => s.id === serviceId);
    if (service) {
      this.activeService.set(serviceId);
    }
  }

  getActiveService(): Service {
    return (
      this.services().find((s) => s.id === this.activeService()) ||
      this.services()[0]
    );
  }

  // ========================================
  // GESTIÓN DE TESTIMONIALES
  // ========================================

  setCurrentTestimonial(index: number): void {
    if (this.isValidTestimonialIndex(index)) {
      this.currentTestimonial.set(index);

      if (this.isBrowser) {
        this.restartTestimonialRotation();
      }
    }
  }

  getStarArray(stars: number): number[] {
    return Array(Math.max(0, Math.min(5, stars))).fill(0);
  }

  // ========================================
  // NAVEGACIÓN
  // ========================================

  onNavigate(route: string): void {
    this.navigateTo(route);
  }

  onLogin(): void {
    this.navigateTo('/auth/login');
  }

  onRegister(): void {
    this.navigateTo('/auth/register');
  }

  // ========================================
  // ACCIONES DE CONVERSIÓN
  // ========================================

  onStartFreeTrial(): void {
    this.navigateTo('/auth/register', { trial: 'true', plan: 'premium' });
  }

  onViewPlans(): void {
    this.showMembershipModal.set(true);
  }

  onStartPremium(): void {
    this.showMembershipModal.set(true);
  }

  onCloseMembershipModal(): void {
    this.showMembershipModal.set(false);
  }

  onSelectPlan(planId: string): void {
    console.log('Plan seleccionado:', planId);
    this.showMembershipModal.set(false);

    // Aquí puedes agregar la lógica para redirigir al proceso de pago
    // Por ejemplo: this.navigateTo('/auth/register', { plan: planId });
  }

  onStartTransformation(): void {
    this.navigateTo('/auth/register', {
      journey: 'transformation',
      source: 'final_cta',
    });
  }

  onViewDemo(): void {
    this.navigateTo('/courses', { filter: 'free' });
  }

  onContactSupport(): void {
    if (this.isBrowser && window.location.hostname !== 'localhost') {
      this.navigateTo('/support');
    } else {
      alert('Función de soporte en desarrollo. Contacta a support@arcana.com');
    }
  }

  // ========================================
  // NUEVO MÉTODO SIMPLE PARA LANZAMIENTO
  // ========================================

  // ========================================
  // MÉTODOS PARA FORMULARIO DE EARLY ACCESS
  // ========================================

  // Propiedades para validación de email
  readonly emailError = signal<boolean>(false);
  readonly emailErrorMessage = signal<string>('');
  readonly emailValid = signal<boolean>(false);

  onToggleEarlyAccess(): void {
    this.showEarlyAccessForm.set(!this.showEarlyAccessForm());
    // Si se cierra el formulario, resetear el estado
    if (!this.showEarlyAccessForm()) {
      this.formSubmitted.set(false);
      this.earlyAccessEmail = '';
    }
  }

  // ========================================
  // VALIDACIÓN DE EMAIL
  // ========================================

  onEmailChange(): void {
    this.validateEmail();
  }

  private validateEmail(): void {
    const email = this.earlyAccessEmail.trim();

    // Reset estados
    this.emailError.set(false);
    this.emailValid.set(false);
    this.emailErrorMessage.set('');

    // Si está vacío, no mostrar error pero tampoco válido
    if (!email) {
      return;
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError.set(true);
      this.emailErrorMessage.set('Por favor ingresa un email válido');
      return;
    }

    // Validar que sea gmail específicamente
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(email)) {
      this.emailError.set(true);
      this.emailErrorMessage.set(
        'Solo se permiten emails de Gmail (@gmail.com)'
      );
      return;
    }

    // Validar longitud del usuario (antes del @)
    const username = email.split('@')[0];
    if (username.length < 3) {
      this.emailError.set(true);
      this.emailErrorMessage.set(
        'El nombre de usuario debe tener al menos 3 caracteres'
      );
      return;
    }

    if (username.length > 30) {
      this.emailError.set(true);
      this.emailErrorMessage.set('El nombre de usuario es demasiado largo');
      return;
    }

    // Validar caracteres consecutivos
    if (/\.{2,}/.test(username)) {
      this.emailError.set(true);
      this.emailErrorMessage.set('No se permiten puntos consecutivos');
      return;
    }

    // Validar que no empiece o termine con punto
    if (username.startsWith('.') || username.endsWith('.')) {
      this.emailError.set(true);
      this.emailErrorMessage.set(
        'El email no puede empezar o terminar con punto'
      );
      return;
    }

    // Si llegamos aquí, el email es válido
    this.emailValid.set(true);
  }

  // Actualizar método onSubmitEarlyAccess para usar la nueva validación
  onSubmitEarlyAccess(): void {
    this.validateEmail();

    if (this.emailError()) {
      return; // No enviar si hay errores
    }

    if (!this.emailValid()) {
      this.emailError.set(true);
      this.emailErrorMessage.set('Por favor ingresa un email válido');
      return;
    }

    const email = this.earlyAccessEmail.trim();

    // Simular verificación de email existente (en producción sería una llamada al backend)
    const existingEmails = [
      'test@gmail.com',
      'demo@gmail.com',
      'ejemplo@gmail.com',
    ];

    if (existingEmails.includes(email.toLowerCase())) {
      this.emailError.set(true);
      this.emailErrorMessage.set(
        'Este email ya está registrado en nuestra lista'
      );
      return;
    }

    // Email válido y no existe, registrar
    this.formSubmitted.set(true);
    this.showSuccessNotification();

    setTimeout(() => {
      this.showEarlyAccessForm.set(false);
      this.formSubmitted.set(false);
      this.earlyAccessEmail = '';
      this.emailError.set(false);
      this.emailValid.set(false);
      this.emailErrorMessage.set('');
    }, 2000);
  }

  // ========================================
  // TRACKING FUNCTIONS PARA *ngFor
  // ========================================

  trackByIndex(index: number): number {
    return index;
  }

  trackByServiceId(index: number, service: Service): string {
    return service.id;
  }

  trackByTestimonialIndex(index: number, testimonial: Testimonial): string {
    return `${testimonial.name}-${index}`;
  }

  // ========================================
  // MÉTODOS PRIVADOS - INICIALIZACIÓN
  // ========================================

  private initializeComponent(): void {
    if (this.isBrowser) {
      this.startTestimonialRotation();
      this.detectMobileDevice();
    }
  }

  private cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTestimonialRotation();
  }

  private detectMobileDevice(): void {
    this.isMobile = window.innerWidth < 768;
  }

  // ========================================
  // MÉTODOS PRIVADOS - TESTIMONIALES
  // ========================================

  private startTestimonialRotation(): void {
    if (!this.isBrowser) return;

    this.testimonialInterval = setInterval(() => {
      const nextIndex =
        (this.currentTestimonial() + 1) % this.testimonials().length;
      this.currentTestimonial.set(nextIndex);
    }, 5000);
  }

  private stopTestimonialRotation(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
      this.testimonialInterval = undefined;
    }
  }

  private restartTestimonialRotation(): void {
    this.stopTestimonialRotation();
    this.startTestimonialRotation();
  }

  private isValidTestimonialIndex(index: number): boolean {
    return index >= 0 && index < this.testimonials().length;
  }

  // ========================================
  // MÉTODOS PRIVADOS - COUNTDOWN
  // ========================================

  private startCountdown(): void {
    if (!this.isBrowser) return;

    this.updateCountdown();

    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    // Calculamos 4 meses desde hoy para garantizar que siempre funcione
    const today = new Date();
    const launchDate = new Date(today);
    launchDate.setMonth(today.getMonth() + 4);
    launchDate.setDate(8); // Día 8 del mes
    launchDate.setHours(12, 0, 0, 0); // Mediodía

    const now = new Date();
    const timeLeft = launchDate.getTime() - now.getTime();

    // Debug para ver qué pasa
    console.log('Fecha actual:', now);
    console.log('Fecha de lanzamiento:', launchDate);
    console.log('Tiempo restante (ms):', timeLeft);

    if (timeLeft <= 0) {
      this.countdown.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      return;
    }

    // Cálculos del countdown
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    this.countdown.set({ days, hours, minutes, seconds });
  }

  // Método para obtener la fecha de lanzamiento formateada
  getLaunchDateFormatted(): string {
    const today = new Date();
    const launchDate = new Date(today);
    launchDate.setMonth(today.getMonth() + 4);
    launchDate.setDate(8);

    return launchDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ========================================
  // MÉTODOS PRIVADOS - NAVEGACIÓN
  // ========================================

  private navigateTo(
    route: string,
    queryParams?: Record<string, string>
  ): void {
    const navigationOptions = queryParams ? { queryParams } : {};

    this.router.navigate([route], navigationOptions).catch((err) => {
      console.error(`Error al navegar a ${route}:`, err);
    });
  }

  // ========================================
  // MÉTODOS PRIVADOS - UTILIDADES
  // ========================================

  private generateRandomStars(
    count: number,
    minDelay: number,
    maxDelay: number
  ): StarConfig[] {
    return Array.from({ length: count }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: minDelay + Math.random() * (maxDelay - minDelay),
    }));
  }

  // Método para hacer scroll suave a una sección específica
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Método principal para mostrar notificaciones
  private showCustomNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    icon: string,
    duration: number = 5000
  ): void {
    this.notificationData.set({ type, title, message, icon });
    this.showNotification.set(true);

    // Limpiar timeout anterior si existe
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Auto-cerrar después del tiempo especificado
    this.notificationTimeout = setTimeout(() => {
      this.closeNotification();
    }, duration);
  }

  // Método para cerrar notificación
  closeNotification(): void {
    this.showNotification.set(false);
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  // ========================================
  // NOTIFICACIONES
  // ========================================

  // Notificación de éxito para email registrado
  private showSuccessNotification(): void {
    this.showCustomNotification(
      'success',
      '¡Email Registrado Exitosamente!',
      'Te notificaremos cuando el acceso anticipado esté disponible. Revisa tu bandeja de entrada.',
      'fas fa-check-circle'
    );
  }

  // Notificación de error para email ya registrado
  private showEmailExistsNotification(): void {
    this.showCustomNotification(
      'warning',
      'Email Ya Registrado',
      'Este correo ya está en nuestra lista de espera. ¡Gracias por tu interés en Arcana!',
      'fas fa-exclamation-triangle',
      4000
    );
  }

  // Notificación de error para email inválido
  private showInvalidEmailNotification(): void {
    this.showCustomNotification(
      'error',
      'Email Inválido',
      'Por favor, introduce un email válido para continuar.',
      'fas fa-times-circle',
      3000
    );
  }
}
