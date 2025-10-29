import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <svg
        [class]="spinnerClasses"
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
      
      <span *ngIf="text" [class]="textClasses">{{ text }}</span>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() variant: SpinnerVariant = 'primary';
  @Input() text = '';
  @Input() centered = false;

  get containerClasses(): string {
    const baseClasses = ['flex', 'items-center'];

    if (this.centered) {
      baseClasses.push('justify-center');
    }

    if (this.text) {
      baseClasses.push('gap-3');
    }

    return baseClasses.join(' ');
  }

  get spinnerClasses(): string {
    const baseClasses = ['animate-spin'];

    // Size classes
    const sizeClasses = {
      xs: ['h-3', 'w-3'],
      sm: ['h-4', 'w-4'],
      md: ['h-6', 'w-6'],
      lg: ['h-8', 'w-8'],
      xl: ['h-12', 'w-12']
    };

    // Variant classes
    const variantClasses = {
      primary: ['text-brand-green-600'],
      secondary: ['text-brand-dark-600'],
      white: ['text-white']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ].join(' ');
  }

  get textClasses(): string {
    const baseClasses = ['font-medium'];

    // Size-based text classes
    const sizeClasses = {
      xs: ['text-xs'],
      sm: ['text-sm'],
      md: ['text-sm'],
      lg: ['text-base'],
      xl: ['text-lg']
    };

    // Variant classes
    const variantClasses = {
      primary: ['text-brand-green-700'],
      secondary: ['text-brand-dark-700'],
      white: ['text-white']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ].join(' ');
  }
}