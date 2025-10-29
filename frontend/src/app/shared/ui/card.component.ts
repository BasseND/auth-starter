import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <!-- Header -->
      <div *ngIf="hasHeader" [class]="headerClasses">
        <div *ngIf="title || subtitle" class="flex-1">
          <h3 *ngIf="title" [class]="titleClasses">{{ title }}</h3>
          <p *ngIf="subtitle" [class]="subtitleClasses">{{ subtitle }}</p>
        </div>
        <div *ngIf="hasHeaderActions" class="flex-shrink-0">
          <ng-content select="[slot=header-actions]"></ng-content>
        </div>
        <ng-content select="[slot=header]"></ng-content>
      </div>

      <!-- Body -->
      <div [class]="bodyClasses">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div *ngIf="hasFooter" [class]="footerClasses">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'md';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() noPadding = false;
  @Input() hoverable = false;
  @Input() clickable = false;

  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.hasHeaderSlot || this.hasHeaderActions);
  }

  get hasFooter(): boolean {
    return this.hasFooterSlot;
  }

  get hasHeaderSlot(): boolean {
    // This would need to be implemented with ViewChild or content projection detection
    // For now, we'll assume it's true if title/subtitle are not provided
    return !this.title && !this.subtitle;
  }

  get hasHeaderActions(): boolean {
    // This would need to be implemented with ViewChild or content projection detection
    return false; // Simplified for now
  }

  get hasFooterSlot(): boolean {
    // This would need to be implemented with ViewChild or content projection detection
    return false; // Simplified for now
  }

  get cardClasses(): string {
    const baseClasses = [
      'bg-white',
      'rounded-lg',
      'transition-all',
      'duration-200'
    ];

    // Variant classes
    const variantClasses = {
      default: ['border', 'border-brand-dark-200'],
      outlined: ['border-2', 'border-brand-dark-300'],
      elevated: ['shadow-lg', 'border', 'border-brand-dark-100'],
      filled: ['bg-brand-dark-50', 'border', 'border-brand-dark-200']
    };

    // Interactive classes
    const interactiveClasses = [];
    if (this.hoverable) {
      interactiveClasses.push('hover:shadow-md', 'hover:border-brand-dark-300');
    }
    if (this.clickable) {
      interactiveClasses.push('cursor-pointer', 'hover:shadow-lg', 'active:scale-[0.98]');
    }

    return [
      ...baseClasses,
      ...variantClasses[this.variant],
      ...interactiveClasses
    ].join(' ');
  }

  get headerClasses(): string {
    const baseClasses = [
      'flex',
      'items-start',
      'justify-between',
      'border-b',
      'border-brand-dark-200'
    ];

    // Size-based padding
    const sizeClasses = {
      sm: ['px-4', 'py-3'],
      md: ['px-6', 'py-4'],
      lg: ['px-8', 'py-5']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get bodyClasses(): string {
    if (this.noPadding) {
      return '';
    }

    // Size-based padding
    const sizeClasses = {
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8']
    };

    return sizeClasses[this.size].join(' ');
  }

  get footerClasses(): string {
    const baseClasses = [
      'border-t',
      'border-brand-dark-200',
      'bg-brand-dark-25'
    ];

    // Size-based padding
    const sizeClasses = {
      sm: ['px-4', 'py-3'],
      md: ['px-6', 'py-4'],
      lg: ['px-8', 'py-5']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get titleClasses(): string {
    return [
      'text-lg',
      'font-semibold',
      'text-brand-dark-900',
      'leading-6'
    ].join(' ');
  }

  get subtitleClasses(): string {
    return [
      'mt-1',
      'text-sm',
      'text-brand-dark-600',
      'leading-5'
    ].join(' ');
  }
}