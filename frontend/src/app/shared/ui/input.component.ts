import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  styles: [`
    :host {
      border: none;
      background-color: transparent;
      padding: 0;
      
    }
   
  `],
  template: `
    <div class="w-full mb-4">
      <!-- Label -->
      <label *ngIf="label" [for]="inputId" [class]="labelClasses">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <!-- Input container -->
      <div [class]="containerClasses">
        <!-- Leading icon -->
        <div *ngIf="leadingIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ng-content select="[slot=leading-icon]"></ng-content>
        </div>

        <!-- Input field -->
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [class]="inputClasses"
          [style.border-color]="getBorderColor()"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        <!-- Trailing icon or toggle for password -->
        <div *ngIf="trailingIcon || type === 'password'" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <!-- Password toggle -->
          <button
            *ngIf="type === 'password'"
            type="button"
            class="text-brand-dark-400 hover:text-brand-dark-600 focus:outline-none dark:text-brand-dark-400 dark:hover:text-brand-dark-200"
            (click)="togglePasswordVisibility()"
          >
            <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          </button>
          
          <!-- Custom trailing icon -->
          <div *ngIf="trailingIcon && type !== 'password'" class="pointer-events-none">
            <ng-content select="[slot=trailing-icon]"></ng-content>
          </div>
        </div>
      </div>

      <!-- Helper text or error message -->
      <div *ngIf="helperText || errorMessage" [class]="messageClasses">
        {{ errorMessage || helperText }}
      </div>
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() helperText = '';
  @Input() leadingIcon = false;
  @Input() trailingIcon = false;
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  @Output() onInputChange = new EventEmitter<string>();
  @Output() onInputFocus = new EventEmitter<void>();
  @Output() onInputBlur = new EventEmitter<void>();

  value = '';
  showPassword = false;
  isFocused = false;

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onInputChange.emit(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
    this.onInputFocus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.onInputBlur.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    // Update the input type dynamically
    const inputElement = document.getElementById(this.inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.type = this.showPassword ? 'text' : 'password';
    }
  }

  getBorderColor(): string {
    if (this.errorMessage) {
      return '#fca5a5'; // red-300
    }
    return '#d1d5db'; // brand-dark-300 equivalent (gray-300)
  }

  get labelClasses(): string {
    return [
      'block',
      'text-sm',
      'font-medium',
      'text-brand-dark-700',
      'mb-1',
      'dark:text-brand-dark-300'
    ].join(' ');
  }

  get containerClasses(): string {
    return [
      'relative',
      'rounded-lg'
    ].join(' ');
  }

  get inputClasses(): string {
    const baseClasses = [
      'block',
      'w-full',
      'rounded-lg',
      'border',
      'border-solid',
      'bg-white',
      'font-sans',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-1',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:bg-brand-dark-50',
      '!border-opacity-100',
      'dark:bg-brand-dark-700',
      'dark:disabled:bg-brand-dark-800'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-3', 'py-2', 'text-sm'],
      lg: ['px-4', 'py-3', 'text-base']
    };

    // State-dependent classes
    const stateClasses = this.errorMessage
      ? [
          '!border-red-300',
          'text-red-900',
          'placeholder-red-300',
          'focus:ring-red-500',
          'focus:!border-red-500',
          'border-red-300',
          'dark:!border-red-400',
          'dark:text-red-100',
          'dark:placeholder-red-400',
          'dark:focus:ring-red-400',
          'dark:focus:!border-red-400'
        ]
      : [
          '!border-brand-dark-300',
          'text-brand-dark-900',
          'placeholder-brand-dark-400',
          'focus:ring-brand-green-500',
          'focus:!border-brand-green-500',
          'border-brand-dark-300',
          'dark:!border-brand-dark-500',
          'dark:text-brand-dark-100',
          'dark:placeholder-brand-dark-400',
          'dark:focus:ring-brand-green-400',
          'dark:focus:!border-brand-green-400'
        ];

    // Padding adjustments for icons
    const paddingClasses = [];
    if (this.leadingIcon) {
      paddingClasses.push('pl-10');
    }
    if (this.trailingIcon || this.type === 'password') {
      paddingClasses.push('pr-10');
    }

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...stateClasses,
      ...paddingClasses
    ].join(' ');
  }

  get messageClasses(): string {
    const baseClasses = [
      'mt-1',
      'text-sm'
    ];

    const colorClasses = this.errorMessage
      ? ['text-red-600', 'dark:text-red-400']
      : ['text-brand-dark-500', 'dark:text-brand-dark-400'];

    return [
      ...baseClasses,
      ...colorClasses
    ].join(' ');
  }
}