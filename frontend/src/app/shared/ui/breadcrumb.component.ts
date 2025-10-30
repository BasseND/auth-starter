import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type BreadcrumbSize = 'sm' | 'md' | 'lg';
export type BreadcrumbSeparator = 'slash' | 'chevron' | 'arrow' | 'dot' | '/' | '>' | '→' | '•';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  disabled?: boolean;
  data?: any;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [attr.aria-label]="ariaLabel" [class]="containerClasses">
      <ol class="flex items-center space-x-1 md:space-x-3">
        <li *ngFor="let item of items; let i = index; trackBy: trackByFn" class="flex items-center">
          <!-- Home icon for first item if showHomeIcon is true -->
          <div *ngIf="i === 0 && showHomeIcon" class="flex items-center">
            <svg [class]="iconClasses" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>

          <!-- Item content -->
          <div class="flex items-center">
            <!-- Custom icon -->
            <ng-container *ngIf="item.icon && (!showHomeIcon || i !== 0)">
              <i [class]="item.icon + ' ' + iconClasses"></i>
            </ng-container>

            <!-- Link or text -->
            <ng-container *ngIf="!isLastItem(i) && item.url && !item.disabled">
              <a
                [routerLink]="item.url"
                [class]="getLinkClasses(item)"
                (click)="onItemClick(item, i)"
                [attr.aria-current]="isLastItem(i) ? 'page' : null"
              >
                {{ item.label }}
              </a>
            </ng-container>

            <ng-container *ngIf="!isLastItem(i) && (!item.url || item.disabled)">
              <button
                type="button"
                [class]="getButtonClasses(item)"
                [disabled]="item.disabled"
                (click)="onItemClick(item, i)"
                [attr.aria-current]="isLastItem(i) ? 'page' : null"
              >
                {{ item.label }}
              </button>
            </ng-container>

            <!-- Current page (last item) -->
            <span
              *ngIf="isLastItem(i)"
              [class]="getCurrentPageClasses()"
              [attr.aria-current]="'page'"
            >
              {{ item.label }}
            </span>
          </div>

          <!-- Separator -->
          <div
            *ngIf="!isLastItem(i)"
            [class]="separatorClasses"
            [attr.aria-hidden]="true"
          >
            <!-- Slash separator -->
            <span *ngIf="separator === 'slash'">/</span>
            
            <!-- Chevron separator -->
            <svg *ngIf="separator === 'chevron'" [class]="separatorIconClasses" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            
            <!-- Arrow separator -->
            <svg *ngIf="separator === 'arrow'" [class]="separatorIconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <!-- Dot separator -->
            <span *ngIf="separator === 'dot'" class="text-lg">•</span>
            
            <!-- Custom separators -->
            <span *ngIf="separator === '/'">/</span>
            <span *ngIf="separator === '>'">></span>
            <span *ngIf="separator === '→'">→</span>
            <span *ngIf="separator === '•'">•</span>
          </div>
        </li>
      </ol>

      <!-- Mobile dropdown for long breadcrumbs -->
      <div *ngIf="showMobileDropdown && items.length > maxMobileItems" class="sm:hidden">
        <select
          [class]="mobileSelectClasses"
          (change)="onMobileSelect($event)"
          [attr.aria-label]="'Navigation rapide'"
        >
          <option *ngFor="let item of items; let i = index" [value]="i" [selected]="isLastItem(i)">
            {{ item.label }}
          </option>
        </select>
      </div>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separator: BreadcrumbSeparator = 'chevron';
  @Input() size: BreadcrumbSize = 'md';
  @Input() showHomeIcon = true;
  @Input() showMobileDropdown = true;
  @Input() maxMobileItems = 2;
  @Input() ariaLabel = 'Fil d\'Ariane';

  @Output() itemClick = new EventEmitter<{ item: BreadcrumbItem; index: number }>();

  get containerClasses(): string {
    const baseClasses = [
      'flex',
      'items-center',
      'space-y-0'
    ];

    return baseClasses.join(' ');
  }

  get iconClasses(): string {
    const baseClasses = [
      'flex-shrink-0',
      'text-brand-dark-400',
      'dark:text-brand-dark-500'
    ];

    const sizeClasses = {
      sm: ['h-3', 'w-3', 'mr-1'],
      md: ['h-4', 'w-4', 'mr-2'],
      lg: ['h-5', 'w-5', 'mr-2']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get separatorClasses(): string {
    const baseClasses = [
      'flex',
      'items-center',
      'text-brand-dark-400',
      'dark:text-brand-dark-500'
    ];

    const sizeClasses = {
      sm: ['mx-1', 'text-xs'],
      md: ['mx-2', 'text-sm'],
      lg: ['mx-3', 'text-base']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get separatorIconClasses(): string {
    const sizeClasses = {
      sm: ['h-3', 'w-3'],
      md: ['h-4', 'w-4'],
      lg: ['h-5', 'w-5']
    };

    return sizeClasses[this.size].join(' ');
  }

  get mobileSelectClasses(): string {
    const baseClasses = [
      'block',
      'w-full',
      'rounded-md',
      'border-brand-dark-300',
      'bg-white',
      'py-2',
      'pl-3',
      'pr-10',
      'text-brand-dark-900',
      'focus:border-brand-green-500',
      'focus:outline-none',
      'focus:ring-1',
      'focus:ring-brand-green-500',
      'dark:border-brand-dark-600',
      'dark:bg-brand-dark-800',
      'dark:text-brand-dark-100'
    ];

    const sizeClasses = {
      sm: ['text-xs'],
      md: ['text-sm'],
      lg: ['text-base']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  getLinkClasses(item: BreadcrumbItem): string {
    const baseClasses = [
      'font-medium',
      'text-brand-dark-500',
      'hover:text-brand-dark-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-brand-green-500',
      'focus:ring-offset-2',
      'rounded',
      'transition-colors',
      'duration-200',
      'dark:text-brand-dark-400',
      'dark:hover:text-brand-dark-200'
    ];

    const sizeClasses = {
      sm: ['text-xs', 'px-1', 'py-0.5'],
      md: ['text-sm', 'px-2', 'py-1'],
      lg: ['text-base', 'px-2', 'py-1']
    };

    const disabledClasses = item.disabled ? [
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    ] : [];

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...disabledClasses
    ].join(' ');
  }

  getButtonClasses(item: BreadcrumbItem): string {
    const baseClasses = [
      'font-medium',
      'text-brand-dark-500',
      'hover:text-brand-dark-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-brand-green-500',
      'focus:ring-offset-2',
      'rounded',
      'transition-colors',
      'duration-200',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'dark:text-brand-dark-400',
      'dark:hover:text-brand-dark-200'
    ];

    const sizeClasses = {
      sm: ['text-xs', 'px-1', 'py-0.5'],
      md: ['text-sm', 'px-2', 'py-1'],
      lg: ['text-base', 'px-2', 'py-1']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  getCurrentPageClasses(): string {
    const baseClasses = [
      'font-medium',
      'text-brand-dark-900',
      'dark:text-brand-dark-100'
    ];

    const sizeClasses = {
      sm: ['text-xs'],
      md: ['text-sm'],
      lg: ['text-base']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  isLastItem(index: number): boolean {
    return index === this.items.length - 1;
  }

  onItemClick(item: BreadcrumbItem, index: number): void {
    if (!item.disabled) {
      this.itemClick.emit({ item, index });
    }
  }

  onMobileSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = parseInt(target.value, 10);
    const item = this.items[index];
    
    if (item && !item.disabled) {
      this.onItemClick(item, index);
    }
  }

  trackByFn(index: number, item: BreadcrumbItem): any {
    return item.url || item.label || index;
  }
}