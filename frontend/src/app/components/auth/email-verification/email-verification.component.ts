import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.css'
})
export class EmailVerificationComponent implements OnInit {
  email: string = '';
  isResending = false;
  resendMessage = '';
  resendError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer l'email depuis les paramètres de la route
    this.email = this.route.snapshot.queryParams['email'] || '';
    
    // Si pas d'email, rediriger vers la page d'inscription
    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  resendVerificationEmail(): void {
    if (!this.email) return;

    this.isResending = true;
    this.resendMessage = '';
    this.resendError = '';

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.resendMessage = 'Email de vérification renvoyé avec succès !';
        this.isResending = false;
      },
      error: (error) => {
        this.resendError = error.message || 'Erreur lors de l\'envoi de l\'email';
        this.isResending = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}