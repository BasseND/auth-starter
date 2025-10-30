import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { ButtonComponent, InputComponent, CardComponent, AlertComponent } from '../../../shared/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, CardComponent, AlertComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // Méthodes pour la validation dynamique du mot de passe
  isPasswordCriteriaValid(criteria: string): boolean {
    const password = this.password?.value || '';
    
    switch (criteria) {
      case 'minLength':
        return password.length >= 12;
      case 'hasCase':
        return /[A-Z]/.test(password) && /[a-z]/.test(password);
      case 'hasNumber':
        return /\d/.test(password);
      case 'hasSpecial':
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      default:
        return false;
    }
  }

  getPasswordCriteriaClass(criteria: string): string {
    const isValid = this.isPasswordCriteriaValid(criteria);
    const hasValue = this.password?.value && this.password.value.length > 0;
    
    if (!hasValue) {
      return 'text-gray-600 dark:text-gray-400';
    }
    
    return isValid 
      ? 'text-green-600 dark:text-green-400 font-medium' 
      : 'text-gray-600 dark:text-gray-400';
  }

  // Méthode helper pour vérifier l'erreur de correspondance des mots de passe
  get passwordMismatchError(): boolean {
    return this.registerForm.hasError('passwordMismatch') && 
           this.confirmPassword?.touched && 
           this.confirmPassword?.value;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    // Si les deux champs sont vides, pas d'erreur
    if (!passwordValue && !confirmPasswordValue) {
      return null;
    }

    // Si les mots de passe ne correspondent pas
    if (passwordValue !== confirmPasswordValue) {
      // Retourner l'erreur au niveau du formulaire
      return { passwordMismatch: true };
    }

    // Les mots de passe correspondent
    return null;
  }

  onSubmit(): void {
    console.log('🚀 onSubmit called');
    console.log('📋 Form valid:', this.registerForm.valid);
    console.log('📋 Form value:', this.registerForm.value);
    console.log('📋 Form errors:', this.registerForm.errors);
    
    if (this.registerForm.invalid) {
      console.log('❌ Form is invalid, marking as touched');
      this.markFormGroupTouched();
      return;
    }

    console.log('✅ Form is valid, proceeding with registration');
    this.isLoading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, password } = this.registerForm.value;
    console.log('📤 Sending registration request with data:', { firstName, lastName, email, password: '***' });

    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (response) => {
        console.log('✅ Registration successful:', response);
        this.isLoading = false;
        if (response.requiresEmailVerification) {
          // Redirect to email verification page
          this.router.navigate(['/auth/email-verification'], { 
            queryParams: { email: email } 
          });
        } else {
          // User is already verified, redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
