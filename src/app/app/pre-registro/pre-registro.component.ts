import { Component, EventEmitter, Output, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pre-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-registro.component.html',
  styleUrl: './pre-registro.component.scss'
})
export class PreRegistroComponent {
  @Output() closeModal = new EventEmitter<void>();

  registrationForm = {
    name: '',
    email: '',
    whatsapp: '',
  };

  readonly registrationErrors = signal({
    name: '',
    email: '',
    whatsapp: '',
  });

  loading = false;
  googleScriptURL = 'https://script.google.com/macros/s/AKfycbwBKH4AJG7dGZzhVyyEiSY9Z6_ne08Ry5xe1tHdWIpSFmFEN5zz0uUk-xYH9Gu41Hpc/exec';
  readonly formSubmitted = signal<boolean>(false);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // Validaciones
  validateName(): boolean {
    const name = this.registrationForm.name.trim();
    if (!name) {
      this.registrationErrors.update((errors) => ({
        ...errors,
        name: 'El nombre es obligatorio',
      }));
      return false;
    }

    this.registrationErrors.update((errors) => ({
      ...errors,
      name: '',
    }));
    return true;
  }

  validateEmail(): boolean {
    const email = this.registrationForm.email.trim();
    if (!email) {
      this.registrationErrors.update((errors) => ({
        ...errors,
        email: 'El email es obligatorio',
      }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.registrationErrors.update((errors) => ({
        ...errors,
        email: 'Por favor ingresa un email válido',
      }));
      return false;
    }

    this.registrationErrors.update((errors) => ({
      ...errors,
      email: '',
    }));
    return true;
  }

  validateWhatsApp(): boolean {
    const whatsapp = this.registrationForm.whatsapp.trim();
    if (!whatsapp) {
      this.registrationErrors.update((errors) => ({
        ...errors,
        whatsapp: 'El WhatsApp es obligatorio',
      }));
      return false;
    }

    this.registrationErrors.update((errors) => ({
      ...errors,
      whatsapp: '',
    }));
    return true;
  }

  // Métodos para manejar cambios en inputs
  onNameChange(): void {
    this.validateName();
  }

  onEmailChange(): void {
    this.validateEmail();
  }

  onWhatsAppChange(): void {
    this.validateWhatsApp();
  }

  isFormValid(): boolean {
    const nameValid = this.validateName();
    const emailValid = this.validateEmail();
    const whatsappValid = this.validateWhatsApp();

    return nameValid && emailValid && whatsappValid;
  }

  // Envío del formulario
  onSubmitRegistration(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    // Crear FormData para enviar (igual que en home.component.ts)
    const formData = new FormData();
    formData.append('name', this.registrationForm.name);
    formData.append('email', this.registrationForm.email);
    formData.append('whatsapp', this.registrationForm.whatsapp);

    this.http
      .post(this.googleScriptURL, formData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.formSubmitted.set(true);
          console.log('✅ Registro exitoso:', response);

          // 🎯 INICIAR DESCARGA AUTOMÁTICA DEL PDF
          setTimeout(() => {
            this.downloadPDF();
          }, 500);

          // Cerrar modal después de 4 segundos
          setTimeout(() => {
            this.onClose();
          }, 4000);
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Error al registrar:', error);

          this.registrationErrors.update((errors) => ({
            ...errors,
            email: 'Error al enviar el formulario. Intenta de nuevo.',
          }));
        },
      });
  }

  // Descarga automática del PDF
  private downloadPDF(): void {
    if (!this.isBrowser) return;

    try {
      const pdfUrl = '/assets/5-rituales-poderosos.pdf';
      const fileName = '5-Rituales-Poderosos-Arcana.pdf';

      // Detectar si es iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isMobile = window.innerWidth < 768;

      if (isIOS || isSafari || isMobile) {
        // Para dispositivos móviles: abrir en nueva ventana
        const newWindow = window.open(pdfUrl, '_blank');
        if (!newWindow) {
          // Si el popup fue bloqueado, mostrar mensaje
          this.showMobileDownloadMessage(pdfUrl);
        }
      } else {
        // Para desktop: descarga tradicional
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.target = '_blank';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log('✅ Descarga del PDF iniciada');
    } catch (error) {
      console.error('❌ Error al descargar PDF:', error);
      // Fallback: abrir en nueva ventana
      window.open('/assets/5-rituales-poderosos.pdf', '_blank');
    }
  }

  private showMobileDownloadMessage(pdfUrl: string): void {
    // Crear un elemento temporal para mostrar instrucciones
    const message = document.createElement('div');
    message.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      text-align: center;
    ">
      <h3 style="color: #333; margin-bottom: 15px;">📱 Descarga Manual</h3>
      <p style="color: #666; margin-bottom: 15px;">
        Si tu PDF no se abrió automáticamente, mantén presionado sobre el botón "Descargar PDF" y selecciona "Descargar".
      </p>
      <a href="${pdfUrl}" target="_blank" download style="
        display: inline-block;
        background: linear-gradient(#e2c36a, #c8a94a);
        color: #2b271f;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-bottom: 10px;
        font-weight: 700;
      ">
        📄 Descargar PDF
      </a>
      <br>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        border: 1px solid #ccc;
        padding: 5px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      ">
        Cerrar
      </button>
    </div>
  `;

    document.body.appendChild(message);

    // Auto-remover después de 20 segundos
    setTimeout(() => {
      if (message.parentElement) {
        message.remove();
      }
    }, 20000);
  }
}
