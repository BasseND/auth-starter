import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand-primary' | 'brand-secondary' | 'brand-primary-outline' | 'brand-secondary-outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
    >
      <div class="flex items-center justify-center gap-2">
        <!-- Loading spinner -->
        <svg
          *ngIf="loading"
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        
        <!-- Icon slot -->
        <ng-content select="[slot=icon]"></ng-content>
        
        <!-- Button text -->
        <span [class]="{ 'sr-only': loading && hideTextOnLoading }">
          <ng-content></ng-content>
        </span>
      </div>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() hideTextOnLoading = false;
  @Input() fullWidth = false;
  
  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-6', 'py-3', 'text-base']
    };

    // Variant classes
    const variantClasses = {
      primary: [
        'bg-brand-green-600',
        'text-white',
        'hover:bg-brand-green-700',
        'focus:ring-brand-green-500',
        'active:bg-brand-green-800',
        'dark:bg-brand-green-500',
        'dark:hover:bg-brand-green-600',
        'dark:active:bg-brand-green-700'
      ],
      secondary: [
        'bg-brand-dark-100',
        'text-brand-dark-900',
        'hover:bg-brand-dark-200',
        'focus:ring-brand-dark-500',
        'active:bg-brand-dark-300',
        'dark:bg-brand-dark-700',
        'dark:text-brand-dark-100',
        'dark:hover:bg-brand-dark-600',
        'dark:active:bg-brand-dark-800'
      ],
      outline: [
        'border',
        'border-brand-green-600',
        'text-brand-green-600',
        'bg-transparent',
        'hover:bg-brand-green-50',
        'focus:ring-brand-green-500',
        'active:bg-brand-green-100',
        'dark:border-brand-green-400',
        'dark:text-brand-green-400',
        'dark:hover:bg-brand-green-900/20',
        'dark:active:bg-brand-green-900/30'
      ],
      ghost: [
        'text-brand-dark-700',
        'bg-transparent',
        'hover:bg-brand-dark-100',
        'focus:ring-brand-dark-500',
        'active:bg-brand-dark-200',
        'dark:text-brand-dark-300',
        'dark:hover:bg-brand-dark-800',
        'dark:active:bg-brand-dark-700'
      ],
      danger: [
        'bg-red-600',
        'text-white',
        'hover:bg-red-700',
        'focus:ring-red-500',
        'active:bg-red-800',
        'dark:bg-red-500',
        'dark:hover:bg-red-600',
        'dark:active:bg-red-700'
      ],
      'brand-primary': [
        'bg-brand-primary',
        'text-brand-dark-900',
        'hover:bg-brand-primary/90',
        'focus:ring-brand-primary/50',
        'active:bg-brand-primary/80',
        'shadow-sm',
        'border',
        'border-brand-primary/20',
        'dark:text-brand-dark-900',
        'dark:border-brand-primary/30'
      ],
      'brand-secondary': [
        'bg-brand-secondary',
        'text-brand-dark-900',
        'hover:bg-brand-secondary/90',
        'focus:ring-brand-secondary/50',
        'active:bg-brand-secondary/80',
        'shadow-sm',
        'border',
        'border-brand-secondary/20',
        'dark:text-brand-dark-900',
        'dark:border-brand-secondary/30'
      ],
      'brand-primary-outline': [
        'border-2',
        'border-brand-primary',
        'text-brand-primary',
        'bg-transparent',
        'hover:bg-brand-primary/10',
        'focus:ring-brand-primary/50',
        'active:bg-brand-primary/20',
        'transition-colors',
        'dark:hover:bg-brand-primary/20',
        'dark:active:bg-brand-primary/30'
      ],
      'brand-secondary-outline': [
        'border-2',
        'border-brand-secondary',
        'text-brand-secondary',
        'bg-transparent',
        'hover:bg-brand-secondary/10',
        'focus:ring-brand-secondary/50',
        'active:bg-brand-secondary/20',
        'transition-colors',
        'dark:hover:bg-brand-secondary/20',
        'dark:active:bg-brand-secondary/30'
      ]
    };

    // Full width class
    const widthClasses = this.fullWidth ? ['w-full'] : [];

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant],
      ...widthClasses
    ].join(' ');
  }
}