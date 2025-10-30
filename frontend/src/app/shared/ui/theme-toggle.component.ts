import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, Theme } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      [class]="buttonClasses"
      [attr.aria-label]="ariaLabel"
      type="button"
    >
      <!-- Icône soleil (mode clair) -->
      <svg
        *ngIf="currentTheme === 'light'"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <!-- Icône lune (mode sombre) -->
      <svg
        *ngIf="currentTheme === 'dark'"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      <span class="sr-only">{{ ariaLabel }}</span>
    </button>
  `,
  styles: [`
    button {
      transition: all 0.2s ease-in-out;
    }
    
    button:hover {
      transform: scale(1.05);
    }
  `]
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get buttonClasses(): string {
    return [
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'p-2',
      'rounded-lg',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'hover:shadow-md',
      // Couleurs pour le mode clair
      'bg-white',
      'border-brand-dark-300',
      'text-brand-dark-700',
      'hover:bg-brand-dark-50',
      'focus:ring-brand-green-500',
      // Couleurs pour le mode sombre
      'dark:bg-brand-dark-800',
      'dark:border-brand-dark-600',
      'dark:text-brand-dark-200',
      'dark:hover:bg-brand-dark-700',
      'dark:focus:ring-brand-green-400'
    ].join(' ');
  }

  get ariaLabel(): string {
    return this.currentTheme === 'light' 
      ? 'Basculer vers le mode sombre' 
      : 'Basculer vers le mode clair';
  }
}