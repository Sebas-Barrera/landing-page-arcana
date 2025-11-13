import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = signal<string>('');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const emailValue = this.email();
    const passwordValue = this.password();

    // Validar campos vacíos
    if (!emailValue || !passwordValue) {
      this.errorMessage.set('Por favor, completa todos los campos');
      this.isLoading.set(false);
      return;
    }

    // Intentar autenticación
    const success = this.authService.login(emailValue, passwordValue);

    if (success) {
      // Redirigir al dashboard
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.errorMessage.set('Credenciales inválidas. Verifica tu email y contraseña.');
    }

    this.isLoading.set(false);
  }
}
