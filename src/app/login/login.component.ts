import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly showError = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir a home
    if (this.authService.isAuthenticated()) {
      // this.router.navigate(['/membresias']);
    }

    // Inicializar formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Valida y procesa el login
   */
  async onSubmit(): Promise<void> {
    // Resetear mensajes de error
    this.showError.set(false);
    this.errorMessage.set('');

    // Validar formulario
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.showError.set(true);
      this.errorMessage.set('Por favor completa todos los campos correctamente');
      return;
    }

    this.isLoading.set(true);

    try {
      const credentials: LoginCredentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      const { data, error } = await this.authService.login(credentials);

      if (error) {
        this.showError.set(true);
        this.errorMessage.set(
          error.message || 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.'
        );
        this.isLoading.set(false);
        return;
      }

      if (data) {
        // Login exitoso - redirigir a home
        console.log('✅ Login exitoso');
        this.router.navigate(['/membresias']);
      }
    } catch (error: any) {
      console.error('❌ Error en el proceso de login:', error);
      this.showError.set(true);
      this.errorMessage.set('Ocurrió un error inesperado. Inténtalo de nuevo.');
      this.isLoading.set(false);
    }
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (field.hasError('email')) {
      return 'Por favor ingresa un email válido';
    }

    if (field.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return '';
  }

  /**
   * Cierra el mensaje de error
   */
  closeError(): void {
    this.showError.set(false);
    this.errorMessage.set('');
  }
}
