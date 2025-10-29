import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  ButtonComponent, 
  InputComponent, 
  CardComponent, 
  AlertComponent, 
  SpinnerComponent 
} from '../../shared/ui';

@Component({
  selector: 'app-ui-demo',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ButtonComponent, 
    InputComponent, 
    CardComponent, 
    AlertComponent, 
    SpinnerComponent
  ],
  template: `
    <div class="min-h-screen bg-brand-dark-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Page Header -->
        <div class="text-center">
          <h1 class="text-4xl font-bold text-brand-dark-900 mb-4">Kit UI - Démonstration</h1>
          <p class="text-lg text-brand-dark-600">Tous les composants réutilisables de l'application</p>
        </div>

        <!-- Buttons Section -->
        <app-card title="Boutons" subtitle="Différentes variantes et tailles">
          <div class="space-y-6">
            <!-- Button Variants -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Variantes Standards</h4>
              <div class="flex flex-wrap gap-3">
                <app-button variant="primary">Primary</app-button>
                <app-button variant="secondary">Secondary</app-button>
                <app-button variant="outline">Outline</app-button>
                <app-button variant="ghost">Ghost</app-button>
                <app-button variant="danger">Danger</app-button>
              </div>
            </div>

            <!-- Brand Button Variants -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Variantes de Marque</h4>
              <div class="flex flex-wrap gap-3">
                <app-button variant="brand-primary">Brand Primary</app-button>
                <app-button variant="brand-secondary">Brand Secondary</app-button>
                <app-button variant="brand-primary-outline">Brand Primary Outline</app-button>
                <app-button variant="brand-secondary-outline">Brand Secondary Outline</app-button>
              </div>
            </div>

            <!-- Button Sizes -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Tailles</h4>
              <div class="flex flex-wrap items-center gap-3">
                <app-button size="sm">Small</app-button>
                <app-button size="md">Medium</app-button>
                <app-button size="lg">Large</app-button>
              </div>
            </div>

            <!-- Button States -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">États</h4>
              <div class="flex flex-wrap gap-3">
                <app-button [loading]="true">Loading</app-button>
                <app-button [disabled]="true">Disabled</app-button>
                <app-button [fullWidth]="true">Full Width</app-button>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Inputs Section -->
        <app-card title="Champs de saisie" subtitle="Différents types et états">
          <form [formGroup]="demoForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-input
                label="Email"
                type="email"
                placeholder="exemple@email.com"
                formControlName="email"
                helperText="Entrez votre adresse email"
              ></app-input>

              <app-input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [errorMessage]="getPasswordError()"
              ></app-input>

              <app-input
                label="Nom complet"
                type="text"
                placeholder="Jean Dupont"
                formControlName="fullName"
                [required]="true"
              ></app-input>

              <app-input
                label="Téléphone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                formControlName="phone"
                helperText="Format international recommandé"
              ></app-input>

              <app-input
                label="Champ désactivé"
                type="text"
                placeholder="Non modifiable"
                [disabled]="true"
                value="Valeur par défaut"
              ></app-input>

              <app-input
                label="Avec erreur"
                type="text"
                placeholder="Saisie invalide"
                errorMessage="Ce champ contient une erreur"
              ></app-input>
            </div>
          </form>
        </app-card>

        <!-- Alerts Section -->
        <app-card title="Alertes" subtitle="Messages et notifications">
          <div class="space-y-4">
            <app-alert 
              type="success" 
              title="Succès !" 
              message="Votre action a été effectuée avec succès."
              [dismissible]="true"
            ></app-alert>

            <app-alert 
              type="error" 
              title="Erreur" 
              message="Une erreur s'est produite lors du traitement de votre demande."
              [dismissible]="true"
            ></app-alert>

            <app-alert 
              type="warning" 
              title="Attention" 
              message="Cette action nécessite votre attention."
              [dismissible]="true"
            ></app-alert>

            <app-alert 
              type="info" 
              title="Information" 
              message="Voici une information importante à retenir."
              [dismissible]="true"
            ></app-alert>
          </div>
        </app-card>

        <!-- Spinners Section -->
        <app-card title="Indicateurs de chargement" subtitle="Spinners et états de chargement">
          <div class="space-y-6">
            <!-- Spinner Sizes -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Tailles</h4>
              <div class="flex items-center gap-6">
                <app-spinner size="xs" text="XS"></app-spinner>
                <app-spinner size="sm" text="Small"></app-spinner>
                <app-spinner size="md" text="Medium"></app-spinner>
                <app-spinner size="lg" text="Large"></app-spinner>
                <app-spinner size="xl" text="XL"></app-spinner>
              </div>
            </div>

            <!-- Spinner Variants -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Variantes</h4>
              <div class="flex items-center gap-6">
                <app-spinner variant="primary" text="Primary"></app-spinner>
                <app-spinner variant="secondary" text="Secondary"></app-spinner>
                <div class="bg-brand-dark-800 p-4 rounded-lg">
                  <app-spinner variant="white" text="White"></app-spinner>
                </div>
              </div>
            </div>

            <!-- Centered Spinner -->
            <div>
              <h4 class="text-sm font-medium text-brand-dark-700 mb-3">Centré</h4>
              <div class="h-24 border-2 border-dashed border-brand-dark-300 rounded-lg">
                <app-spinner [centered]="true" text="Chargement..."></app-spinner>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Cards Section -->
        <app-card title="Cartes" subtitle="Différentes variantes de cartes">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-card variant="default" title="Carte par défaut" subtitle="Description de la carte">
              <p class="text-brand-dark-600">Contenu de la carte avec variant par défaut.</p>
            </app-card>

            <app-card variant="outlined" title="Carte avec bordure" subtitle="Bordure plus épaisse">
              <p class="text-brand-dark-600">Contenu de la carte avec bordure accentuée.</p>
            </app-card>

            <app-card variant="elevated" title="Carte élevée" subtitle="Avec ombre">
              <p class="text-brand-dark-600">Contenu de la carte avec effet d'élévation.</p>
            </app-card>

            <app-card variant="filled" title="Carte remplie" subtitle="Arrière-plan coloré">
              <p class="text-brand-dark-600">Contenu de la carte avec arrière-plan.</p>
            </app-card>

            <app-card [hoverable]="true" title="Carte interactive" subtitle="Effet au survol">
              <p class="text-brand-dark-600">Passez la souris pour voir l'effet.</p>
            </app-card>

            <app-card [clickable]="true" title="Carte cliquable" subtitle="Effet au clic">
              <p class="text-brand-dark-600">Cliquez pour voir l'effet.</p>
            </app-card>
          </div>
        </app-card>

      </div>
    </div>
  `
})
export class UiDemoComponent {
  demoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      phone: [''],
    });
  }

  getPasswordError(): string {
    const passwordControl = this.demoForm.get('password');
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        return 'Le mot de passe est requis';
      }
      if (passwordControl.errors?.['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    return '';
  }
}