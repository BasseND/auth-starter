import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
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
      <label *ngIf="label" [for]="textareaId" [class]="labelClasses">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <!-- Textarea container -->
      <div [class]="containerClasses">
        <!-- Textarea field -->
        <textarea
          [id]="textareaId"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [rows]="rows"
          [cols]="cols"
          [attr.maxlength]="maxLength"
          [attr.minlength]="minLength"
          [class]="textareaClasses"
          [value]="value"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [attr.aria-describedby]="(errorMessage || helperText) ? textareaId + '-message' : null"
          [attr.aria-invalid]="errorMessage ? 'true' : 'false'"
        ></textarea>

        <!-- Character count -->
        <div *ngIf="showCharacterCount && maxLength" [class]="characterCountClasses">
          {{ value.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- Helper text or error message -->
      <div 
        *ngIf="errorMessage || helperText" 
        [id]="textareaId + '-message'"
        [class]="messageClasses"
        role="alert"
        [attr.aria-live]="errorMessage ? 'assertive' : 'polite'"
      >
        {{ errorMessage || helperText }}
      </div>
    </div>
  `
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() size: TextareaSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() helperText = '';
  @Input() rows = 4;
  @Input() cols?: number;
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() resize: TextareaResize = 'vertical';
  @Input() showCharacterCount = false;
  @Input() autoResize = false;
  @Input() textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;

  @Output() onTextareaChange = new EventEmitter<string>();
  @Output() onTextareaFocus = new EventEmitter<void>();
  @Output() onTextareaBlur = new EventEmitter<void>();

  value = '';
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
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTextareaChange.emit(this.value);

    // Auto-resize functionality
    if (this.autoResize) {
      this.adjustHeight(target);
    }
  }

  onFocus(): void {
    this.isFocused = true;
    this.onTextareaFocus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.onTextareaBlur.emit();
  }

  private adjustHeight(element: HTMLTextAreaElement): void {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
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

  get textareaClasses(): string {
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

    // Resize classes
    const resizeClasses = {
      none: ['resize-none'],
      vertical: ['resize-y'],
      horizontal: ['resize-x'],
      both: ['resize']
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

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...resizeClasses[this.resize],
      ...stateClasses
    ].join(' ');
  }

  get characterCountClasses(): string {
    const baseClasses = [
      'absolute',
      'bottom-2',
      'right-2',
      'text-xs',
      'pointer-events-none'
    ];

    const colorClasses = this.maxLength && this.value.length > this.maxLength * 0.9
      ? ['text-yellow-600', 'dark:text-yellow-400']
      : this.maxLength && this.value.length >= this.maxLength
      ? ['text-red-600', 'dark:text-red-400']
      : ['text-brand-dark-500', 'dark:text-brand-dark-400'];

    return [
      ...baseClasses,
      ...colorClasses
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