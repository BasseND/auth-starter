import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="alertClasses" role="alert">
      <div class="flex">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg [class]="iconClasses" fill="currentColor" viewBox="0 0 20 20">
            <!-- Success icon -->
            <path *ngIf="type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            
            <!-- Error icon -->
            <path *ngIf="type === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            
            <!-- Warning icon -->
            <path *ngIf="type === 'warning'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            
            <!-- Info icon -->
            <path *ngIf="type === 'info'" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Content -->
        <div class="ml-3 flex-1">
          <h3 *ngIf="title" [class]="titleClasses">{{ title }}</h3>
          <div [class]="messageClasses">
            <p *ngIf="message">{{ message }}</p>
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Close button -->
        <div *ngIf="dismissible" class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              [class]="closeButtonClasses"
              (click)="onDismiss()"
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() size: AlertSize = 'md';
  @Input() title = '';
  @Input() message = '';
  @Input() dismissible = false;

  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

  get alertClasses(): string {
    const baseClasses = [
      'rounded-lg',
      'border',
      'font-sans'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-5']
    };

    // Type-specific classes
    const typeClasses = {
      success: [
        'bg-green-50',
        'border-green-200',
        'text-green-800',
        'dark:bg-green-900/20',
        'dark:border-green-800',
        'dark:text-green-200'
      ],
      error: [
        'bg-red-50',
        'border-red-200',
        'text-red-800',
        'dark:bg-red-900/20',
        'dark:border-red-800',
        'dark:text-red-200'
      ],
      warning: [
        'bg-yellow-50',
        'border-yellow-200',
        'text-yellow-800',
        'dark:bg-yellow-900/20',
        'dark:border-yellow-800',
        'dark:text-yellow-200'
      ],
      info: [
        'bg-blue-50',
        'border-blue-200',
        'text-blue-800',
        'dark:bg-blue-900/20',
        'dark:border-blue-800',
        'dark:text-blue-200'
      ]
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...typeClasses[this.type]
    ].join(' ');
  }

  get iconClasses(): string {
    const baseClasses = ['h-5', 'w-5'];

    const typeClasses = {
      success: ['text-green-400', 'dark:text-green-300'],
      error: ['text-red-400', 'dark:text-red-300'],
      warning: ['text-yellow-400', 'dark:text-yellow-300'],
      info: ['text-blue-400', 'dark:text-blue-300']
    };

    return [
      ...baseClasses,
      ...typeClasses[this.type]
    ].join(' ');
  }

  get titleClasses(): string {
    const baseClasses = ['text-sm', 'font-medium'];

    const typeClasses = {
      success: ['text-green-800', 'dark:text-green-200'],
      error: ['text-red-800', 'dark:text-red-200'],
      warning: ['text-yellow-800', 'dark:text-yellow-200'],
      info: ['text-blue-800', 'dark:text-blue-200']
    };

    return [
      ...baseClasses,
      ...typeClasses[this.type]
    ].join(' ');
  }

  get messageClasses(): string {
    const baseClasses = ['text-sm'];
    
    if (this.title) {
      baseClasses.push('mt-1');
    }

    const typeClasses = {
      success: ['text-green-700', 'dark:text-green-300'],
      error: ['text-red-700', 'dark:text-red-300'],
      warning: ['text-yellow-700', 'dark:text-yellow-300'],
      info: ['text-blue-700', 'dark:text-blue-300']
    };

    return [
      ...baseClasses,
      ...typeClasses[this.type]
    ].join(' ');
  }

  get closeButtonClasses(): string {
    const baseClasses = [
      'inline-flex',
      'rounded-md',
      'p-1.5',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2'
    ];

    const typeClasses = {
      success: [
        'text-green-500',
        'hover:bg-green-100',
        'focus:ring-green-600',
        'focus:ring-offset-green-50',
        'dark:text-green-400',
        'dark:hover:bg-green-800/30',
        'dark:focus:ring-green-500',
        'dark:focus:ring-offset-green-900/20'
      ],
      error: [
        'text-red-500',
        'hover:bg-red-100',
        'focus:ring-red-600',
        'focus:ring-offset-red-50',
        'dark:text-red-400',
        'dark:hover:bg-red-800/30',
        'dark:focus:ring-red-500',
        'dark:focus:ring-offset-red-900/20'
      ],
      warning: [
        'text-yellow-500',
        'hover:bg-yellow-100',
        'focus:ring-yellow-600',
        'focus:ring-offset-yellow-50',
        'dark:text-yellow-400',
        'dark:hover:bg-yellow-800/30',
        'dark:focus:ring-yellow-500',
        'dark:focus:ring-offset-yellow-900/20'
      ],
      info: [
        'text-blue-500',
        'hover:bg-blue-100',
        'focus:ring-blue-600',
        'focus:ring-offset-blue-50',
        'dark:text-blue-400',
        'dark:hover:bg-blue-800/30',
        'dark:focus:ring-blue-500',
        'dark:focus:ring-offset-blue-900/20'
      ]
    };

    return [
      ...baseClasses,
      ...typeClasses[this.type]
    ].join(' ');
  }
}