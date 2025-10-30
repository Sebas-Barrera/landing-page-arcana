import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-de-privacidad',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './politica-de-privacidad.component.html',
  styleUrl: './politica-de-privacidad.component.scss'
})
export class PoliticaDePrivacidadComponent {
  currentDate: string = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
