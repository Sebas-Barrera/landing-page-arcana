import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; // 👈 Agregar RouterModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule], // 👈 Agregar RouterModule aquí
  template: `
    <router-outlet></router-outlet>
    
    <!-- Footer que aparece en todas las páginas -->
    <footer class="relative z-10 border-t" style="border-color: #3a3a5a; background-color: #100820">
      <div class="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <!-- Logo y copyright -->
          <div class="flex items-center space-x-4">
            <img 
              src="assets/logo/logoMargenDorado.png" 
              alt="Arcana Logo" 
              class="h-8 w-auto opacity-80"
            >
            <span class="text-sm opacity-70" style="color: #b4a2fd">
              © 2025 Arcana. Todos los derechos reservados.
            </span>
          </div>

          <!-- Enlaces legales -->
          <div class="flex space-x-6">
            <a 
              routerLink="/terminos-y-condiciones"
              class="text-sm hover:text-white transition-colors duration-300 cursor-pointer"
              style="color: #b4a2fd"
            >
              Términos y Condiciones
            </a>
            <a 
              routerLink="/soporte"
              class="text-sm hover:text-white transition-colors duration-300 cursor-pointer"
              style="color: #b4a2fd"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'arcana';
}