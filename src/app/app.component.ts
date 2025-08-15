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
import { HttpClient } from '@angular/common/http';

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

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ========================================
// NUEVAS INTERFACES
// ========================================

export interface OfficialDescriptionData {
  text: string;
  inspiration: string;
  highlights: {
    icon: string;
    text: string;
    color: string;
  }[];
}

export interface FortuneState {
  hasSeenToday: boolean;
  lastSeenDate: string;
  currentMessage: string;
}

export interface Differentiator {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
}

export interface BrandValue {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
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
      price: '$99',
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
      price: '$199',
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
      price: '$699',
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

  readonly differentiators = signal<Differentiator[]>([
    {
      id: 'experience',
      title: 'Más de 30 Años de Sabiduría',
      description:
        'Creada por maestros y guías con un recorrido profundo en el arte místico y la práctica espiritual.',
      icon: 'fas fa-user-graduate',
      color: '#ffa500',
      badge: 'Expertos Certificados',
    },
    {
      id: 'accessibility',
      title: 'Contenido Accesible y Místico',
      description:
        'Información comprensible para todos los niveles, sin perder la profundidad y misticismo auténtico.',
      icon: 'fas fa-book-open',
      color: '#b4a2fd',
    },
    {
      id: 'integration',
      title: 'Múltiples Corrientes Mágicas',
      description: 'Integración de diversas ramas espirituales.',
      icon: 'fas fa-infinity',
      color: '#50c878',
    },
    {
      id: 'interactive',
      title: 'Formato Interactivo Único',
      description:
        'Experiencia visual y tecnológica que hace la espiritualidad más cercana y envolvente.',
      icon: 'fas fa-mobile-alt',
      color: '#20b2aa',
    },
    {
      id: 'expansion',
      title: 'Visión Global y Física',
      description:
        'Plan de expansión internacional con tiendas físicas en México, España, Argentina y más países.',
      icon: 'fas fa-globe-americas',
      color: '#ff69b4',
    },
    {
      id: 'community',
      title: 'Comunidad de Transformación',
      description:
        'Más que usuarios, somos una familia espiritual que se apoya mutuamente en el crecimiento.',
      icon: 'fas fa-users',
      color: '#ffa500',
    },
  ]);

  readonly brandValues = signal<BrandValue[]>([
    {
      id: 'authenticity',
      name: 'Autenticidad',
      description:
        'Verdad y coherencia en cada contenido, fruto de conocimiento profundo y sabiduría ancestral.',
      icon: 'fas fa-certificate',
      color: '#ffa500',
    },
    {
      id: 'purpose',
      name: 'Propósito',
      description:
        'Cada herramienta nace para generar transformación positiva y despertar el potencial que llevas dentro.',
      icon: 'fas fa-bullseye',
      color: '#b4a2fd',
    },
    {
      id: 'closeness',
      name: 'Cercanía',
      description:
        'Un lenguaje claro y cálido que acompaña tanto a quienes dan sus primeros pasos como a quienes ya caminan con experiencia en el sendero espiritual.',
      icon: 'fas fa-heart',
      color: '#ff69b4',
    },
    {
      id: 'diversity',
      name: 'Diversidad Espiritual',
      description:
        'Inspiración tomada de múltiples tradiciones, culturas y saberes que enriquecen tu conexión interior.',
      icon: 'fas fa-yin-yang',
      color: '#50c878',
    },
    {
      id: 'transformation',
      name: 'Evolución Diaria',
      description:
        'Inspiración tomada de múltiples tradiciones, culturas y saberes que enriquecen tu conexión interior.',
      icon: 'fas fa-seedling',
      color: '#20b2aa',
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
  // NUEVAS PROPIEDADES - DESCRIPCIÓN OFICIAL
  // ========================================

  readonly officialDescription = signal<OfficialDescriptionData>({
    text: 'Arcana es tu guía mágica y espiritual, con mensajes, rituales y hechizos que abren caminos y elevan tu energía. Descubre el poder de cristales, hierbas y flores; atrae abundancia, amor, trabajo y bienestar. Accede a cursos, talleres, fases lunares y una comunidad mágica que te acompaña, además de un tarot interactivo para guiar tus decisiones.',
    inspiration: 'Despierta tu poder: magia ancestral para la vida moderna',
    highlights: [
      {
        icon: 'fas fa-gem',
        text: 'Cristales y Gemas',
        color: '#50c878',
      },
      {
        icon: 'fas fa-leaf',
        text: 'Hierbas y Flores',
        color: '#20b2aa',
      },
      {
        icon: 'fas fa-moon',
        text: 'Fases Lunares',
        color: '#e6e6fa',
      },
      {
        icon: 'fas fa-users',
        text: 'Comunidad Mágica',
        color: '#b4a2fd',
      },
      {
        icon: 'fas fa-magic',
        text: 'Rituales y Hechizos',
        color: '#ffa500',
      },
      {
        icon: 'fas fa-eye',
        text: 'Tarot Interactivo',
        color: '#9370db',
      },
    ],
  });

  // ========================================
  // PROPIEDADES PARA COUNTDOWN Y FORMULARIO
  // ========================================

  readonly countdown = signal<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  readonly showEarlyAccessForm = signal<boolean>(false);
  earlyAccessEmail: string = '';
  loading = false;
  googleScriptURL =
    'https://script.google.com/macros/s/AKfycbwjImYUG8Z6SQgS9EgNkL9r3T69INHsC_0PtRf4CViGB4ptkqXl5lce8t7tAGvq4eJz/exec';
  readonly formSubmitted = signal<boolean>(false);

  // ========================================
  // NUEVAS PROPIEDADES - GATITO DE LA FORTUNA
  // ========================================

  readonly isThrowingCookie = signal<boolean>(false);
  readonly isCookieFlying = signal<boolean>(false);
  readonly showFortuneMessage = signal<boolean>(false);
  readonly showFortunePaper = signal<boolean>(false);
  readonly showResetButton = signal<boolean>(false);
  readonly dailyFortuneMessage = signal<string>('');

  // Mensajes de fortuna
  private readonly fortuneMessages: string[] = [
    'La energía del universo conspira a tu favor hoy. Mantén tu corazón abierto a las sorpresas.',
    'Los cristales susurran secretos de abundancia. Escucha con tu alma y actúa con confianza.',
    'Tu intuición es tu mejor guía. Confía en las señales que el cosmos te envía.',
    'Las fases lunares traen renovación. Es momento de dejar ir lo que ya no te sirve.',
    'El amor propio es la magia más poderosa. Honra tu luz interior y verás milagros.',
    'Los caminos se abren cuando sigues tu verdad. No temas brillar con autenticidad.',
    'La abundancia fluye hacia quienes vibran en gratitud. Celebra cada pequeña bendición.',
    'Tu energía atrae experiencias similares. Irradia positividad y recibe prosperidad.',
    'Los rituales de protección te rodean de luz dorada. Camina seguro en tu poder.',
    'La sabiduría ancestral vive en ti. Confía en el conocimiento que llevas en el alma.',
  ];

  // Propiedades para validación de email
  readonly emailError = signal<boolean>(false);
  readonly emailErrorMessage = signal<string>('');
  readonly emailValid = signal<boolean>(false);

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
    private deviceService: DeviceDetectionService,
    private http: HttpClient
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
      this.initializeFortuneCat();
      this.setupScrollNavbar();
      this.initializeNavbar(); // 👈 Agregar esta línea

      this.deviceService.isMobile$.subscribe((isMobile) => {
        this.isMobile = isMobile;
      });
    }
  }

  // 👈 Agregar este método
  private initializeNavbar(): void {
    const navbar = document.querySelector('.navbar-container');
    if (navbar) {
      navbar.classList.add('navbar-visible');
    }
  }

  private setupScrollNavbar(): void {
    let lastScrollY = 0;
    let ticking = false;

    const updateNavbar = () => {
      const navbar = document.querySelector('.navbar-container');
      if (!navbar) return;

      const currentScrollY = window.scrollY;

      // Solo aplicar hide/show en móviles
      if (this.isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling hacia abajo y pasó los 100px - ocultar
          navbar.classList.add('navbar-hidden');
          navbar.classList.remove('navbar-visible');
        } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
          // Scrolling hacia arriba o está en el top - mostrar
          navbar.classList.remove('navbar-hidden');
          navbar.classList.add('navbar-visible');
        }
      } else {
        // En desktop siempre visible
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
      }

      // Efecto de blur para scroll (funciona en todos los dispositivos)
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    });
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

    // Limpiar estado al destruir componente
    this.unblockBodyScroll();
    this.showNavbar(); // 👈 Agregar
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
    this.blockBodyScroll();
    this.hideNavbar(); // 👈 Agregar
  }

  onStartPremium(): void {
    this.showMembershipModal.set(true);
    this.blockBodyScroll();
    this.hideNavbar(); // 👈 Agregar
  }

  onCloseMembershipModal(): void {
    this.showMembershipModal.set(false);
    this.unblockBodyScroll();
    this.showNavbar(); // 👈 Agregar
  }

  onSelectPlan(planId: string): void {
    console.log('Plan seleccionado:', planId);

    // Cerrar modal y restaurar navbar
    this.showMembershipModal.set(false);
    this.unblockBodyScroll();
    this.showNavbar();

    // Si es un plan "Próximamente", redirigir al countdown
    const selectedPlan = this.membershipPlans().find(
      (plan) => plan.id === planId
    );
    if (selectedPlan && selectedPlan.buttonText === 'Próximamente') {
      // Pequeño delay para que se cierre el modal primero
      setTimeout(() => {
        this.scrollToSection('el-despertar-llega-pronto');
      }, 300);
    } else {
      // Aquí puedes agregar lógica para planes activos en el futuro
      // Por ejemplo: redirigir a página de pago
      console.log('Redirigir a proceso de pago para:', planId);
    }
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
  // MÉTODOS PARA FORMULARIO DE EARLY ACCESS
  // ========================================

  submitEmailToGoogleSheets(email: string) {
    const body = new FormData();
    body.append('email', email);

    return this.http.post(this.googleScriptURL, body, { responseType: 'text' });
  }

  onSubmitEarlyAccess(): void {
    this.loading = true;
    this.validateEmail();

    if (this.emailError()) {
      this.loading = false; // Resetear loading en caso de error
      return;
    }

    if (!this.emailValid()) {
      this.emailError.set(true);
      this.emailErrorMessage.set('Por favor ingresa un email válido');
      this.loading = false; // Resetear loading en caso de error
      return;
    }

    const email = this.earlyAccessEmail.trim();

    this.submitEmailToGoogleSheets(email).subscribe({
      next: () => {
        this.loading = false; // Resetear loading en éxito
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
      },
      error: () => {
        this.loading = false; // Resetear loading en error
        this.emailError.set(true);
        this.emailErrorMessage.set('❌ Hubo un error, intenta de nuevo.');
      },
    });
  }

  onToggleEarlyAccess(): void {
    this.showEarlyAccessForm.set(!this.showEarlyAccessForm());
    if (!this.showEarlyAccessForm()) {
      this.formSubmitted.set(false);
      this.earlyAccessEmail = '';
    }
  }

  onEmailChange(): void {
    this.validateEmail();
  }

  private validateEmail(): void {
    const email = this.earlyAccessEmail.trim();

    this.emailError.set(false);
    this.emailValid.set(false);
    this.emailErrorMessage.set('');

    if (!email) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError.set(true);
      this.emailErrorMessage.set('Por favor ingresa un email válido');
      return;
    }

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

    if (/\.{2,}/.test(username)) {
      this.emailError.set(true);
      this.emailErrorMessage.set('No se permiten puntos consecutivos');
      return;
    }

    if (username.startsWith('.') || username.endsWith('.')) {
      this.emailError.set(true);
      this.emailErrorMessage.set(
        'El email no puede empezar o terminar con punto'
      );
      return;
    }

    this.emailValid.set(true);
  }

  submitEmail() {
    if (!this.earlyAccessEmail) return;

    this.http
      .post(this.googleScriptURL, { email: this.earlyAccessEmail })
      .subscribe({
        next: () => {
          this.loading = false;
          alert('✅ ¡Te has registrado para early access!');
          this.earlyAccessEmail = '';
        },
        error: () => {
          this.loading = false;
          alert('❌ Hubo un error, intenta de nuevo.');
        },
      });
  }

  // ========================================
  // NUEVOS MÉTODOS - GATITO DE LA FORTUNA
  // ========================================

  onFortuneCatClick(): void {
    if (!this.canGetNewFortune()) {
      this.resetFortuneAnimation();
      return;
    }

    this.startFortuneSequence();
  }

  public canGetNewFortune(): boolean {
    if (!this.isBrowser) return true;

    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem('fortune_last_seen');

    return lastSeen !== today;
  }

  private startFortuneSequence(): void {
    this.isThrowingCookie.set(true);

    setTimeout(() => {
      this.isThrowingCookie.set(false);
      this.isCookieFlying.set(true);

      setTimeout(() => {
        this.isCookieFlying.set(false);
        this.showFortuneMessage.set(true);
        this.generateDailyMessage();

        setTimeout(() => {
          this.showFortunePaper.set(true);

          setTimeout(() => {
            this.showResetButton.set(true);
            this.markFortuneAsSeen();
          }, 800);
        }, 500);
      }, 2000);
    }, 1000);
  }

  private generateDailyMessage(): void {
    if (!this.isBrowser) {
      this.dailyFortuneMessage.set(this.fortuneMessages[0]);
      return;
    }

    const today = new Date();
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    const messageIndex = seed % this.fortuneMessages.length;

    const message = this.fortuneMessages[messageIndex];
    this.dailyFortuneMessage.set(message);
  }

  private markFortuneAsSeen(): void {
    if (!this.isBrowser) return;

    const today = new Date().toDateString();
    localStorage.setItem('fortune_last_seen', today);
    localStorage.setItem('fortune_current_message', this.dailyFortuneMessage());
  }

  resetFortuneAnimation(): void {
    this.isThrowingCookie.set(false);
    this.isCookieFlying.set(false);
    this.showFortuneMessage.set(false);
    this.showFortunePaper.set(false);
    this.showResetButton.set(false);

    if (!this.canGetNewFortune() && this.isBrowser) {
      const savedMessage = localStorage.getItem('fortune_current_message');
      if (savedMessage) {
        this.dailyFortuneMessage.set(savedMessage);
      }
    }

    setTimeout(() => {
      this.startFortuneSequence();
    }, 300);
  }

  private initializeFortuneCat(): void {
    if (!this.canGetNewFortune()) {
      const savedMessage = localStorage.getItem('fortune_current_message');
      if (savedMessage) {
        this.dailyFortuneMessage.set(savedMessage);
      } else {
        this.generateDailyMessage();
      }
    }
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
    const launchDate = new Date(2025, 9, 15, 12, 0, 0, 0);

    const now = new Date();
    const timeLeft = launchDate.getTime() - now.getTime();

    if (timeLeft <= 0) {
      this.countdown.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    this.countdown.set({ days, hours, minutes, seconds });
  }

  getLaunchDateFormatted(): string {
    const launchDate = new Date(2025, 9, 15);

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

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS - NOTIFICACIONES
  // ========================================

  private showCustomNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    icon: string,
    duration: number = 5000
  ): void {
    this.notificationData.set({ type, title, message, icon });
    this.showNotification.set(true);

    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationTimeout = setTimeout(() => {
      this.closeNotification();
    }, duration);
  }

  closeNotification(): void {
    this.showNotification.set(false);
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  private showSuccessNotification(): void {
    this.showCustomNotification(
      'success',
      '¡Email Registrado Exitosamente!',
      'Te notificaremos cuando el acceso anticipado esté disponible. Revisa tu bandeja de entrada.',
      'fas fa-check-circle'
    );
  }

  private showEmailExistsNotification(): void {
    this.showCustomNotification(
      'warning',
      'Email Ya Registrado',
      'Este correo ya está en nuestra lista de espera. ¡Gracias por tu interés en Arcana!',
      'fas fa-exclamation-triangle',
      4000
    );
  }

  private showInvalidEmailNotification(): void {
    this.showCustomNotification(
      'error',
      'Email Inválido',
      'Por favor, introduce un email válido para continuar.',
      'fas fa-times-circle',
      3000
    );
  }

  // ========================================
  // MÉTODOS PARA CONTROL DE SCROLL DEL BODY
  // ========================================

  private blockBodyScroll(): void {
    if (this.isBrowser) {
      document.body.classList.add('modal-open');
      // Alternativa más robusta si la primera no funciona:
      // document.body.style.overflow = 'hidden';
    }
  }

  private unblockBodyScroll(): void {
    if (this.isBrowser) {
      document.body.classList.remove('modal-open');
      // Alternativa más robusta si la primera no funciona:
      // document.body.style.overflow = '';
    }
  }

  // ========================================
  // MÉTODOS PARA OCULTAR/MOSTRAR NAVBAR
  // ========================================

  private hideNavbar(): void {
    if (this.isBrowser) {
      const navbar = document.querySelector('.navbar-container');
      if (navbar) {
        navbar.classList.add('navbar-modal-hidden');
      }
    }
  }

  private showNavbar(): void {
    if (this.isBrowser) {
      const navbar = document.querySelector('.navbar-container');
      if (navbar) {
        navbar.classList.remove('navbar-modal-hidden');
      }
    }
  }
}
