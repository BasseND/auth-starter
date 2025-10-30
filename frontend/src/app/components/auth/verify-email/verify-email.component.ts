import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertComponent, CardComponent, ButtonComponent }  from '../../../shared/ui';



@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, AlertComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = true;
  isSuccess = false;
  isError = false;
  message = '';
  token = '';

  ngOnInit(): void {
    // Récupérer le token depuis les paramètres de la route
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.isLoading = false;
        this.isError = true;
        this.message = 'Token de vérification manquant.';
        return;
      }

      // Procéder à la vérification
      this.verifyEmail();
    });
  }

  verifyEmail(): void {
    this.authService.verifyEmail(this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = response.message || 'Email vérifié avec succès !';
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = error.message || 'Erreur lors de la vérification de l\'email.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToResendVerification(): void {
    this.router.navigate(['/auth/email-verification']);
  }
}