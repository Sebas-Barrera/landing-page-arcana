import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Star {
  top: number;
  left: number;
  delay: number;
}

@Component({
  selector: 'app-succes',
  imports: [],
  templateUrl: './succes.component.html',
  styleUrl: './succes.component.scss',
})
export class SuccesComponent implements OnInit, OnDestroy {
  largeStars: Star[] = [];
  mediumStars: Star[] = [];
  smallStars: Star[] = [];
  sparkles: Star[] = [];
  floatingSparkles: Star[] = [];

  private autoCloseTimeout?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {
    this.generateStars();
  }

  ngOnInit(): void {
    // Auto-cerrar después de 5 segundos
    // this.autoCloseTimeout = setTimeout(() => {
    //   this.closeSuccess();
    // }, 5000);
  }

  ngOnDestroy(): void {
    // if (this.autoCloseTimeout) {
    //   clearTimeout(this.autoCloseTimeout);
    // }
  }

  private generateStars(): void {
    // Generar estrellas grandes
    for (let i = 0; i < 15; i++) {
      this.largeStars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 4,
      });
    }

    // Generar estrellas medianas
    for (let i = 0; i < 30; i++) {
      this.mediumStars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 3,
      });
    }

    // Generar estrellas pequeñas
    for (let i = 0; i < 50; i++) {
      this.smallStars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
      });
    }

    // Generar sparkles
    for (let i = 0; i < 20; i++) {
      this.sparkles.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 6,
      });
    }

    // Generar floating sparkles
    for (let i = 0; i < 15; i++) {
      this.floatingSparkles.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 8,
      });
    }
  }

  closeSuccess(): void {
    this.router.navigate(['/']);
  }
}
