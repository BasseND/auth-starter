import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  maxVisiblePages?: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav [attr.aria-label]="ariaLabel" class="flex items-center justify-between">
      <!-- Info section (left side) -->
      <div *ngIf="showInfo" class="flex-1 flex justify-between sm:hidden">
        <span [class]="infoClasses">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
      </div>

      <div *ngIf="showInfo" class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p [class]="infoClasses">
            Affichage de
            <span class="font-medium">{{ startItem }}</span>
            à
            <span class="font-medium">{{ endItem }}</span>
            sur
            <span class="font-medium">{{ totalItems }}</span>
            résultats
          </p>
        </div>
      </div>

      <!-- Pagination controls -->
      <div class="flex-1 flex justify-center sm:justify-end">
        <div class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" role="group">
          <!-- First page button -->
          <button
            *ngIf="showFirstLast && currentPage > 1"
            type="button"
            [class]="getButtonClasses('first')"
            [disabled]="currentPage === 1"
            (click)="goToPage(1)"
            [attr.aria-label]="'Aller à la première page'"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Previous page button -->
          <button
            *ngIf="showPrevNext"
            type="button"
            [class]="getButtonClasses('prev')"
            [disabled]="currentPage === 1"
            (click)="goToPrevious()"
            [attr.aria-label]="'Aller à la page précédente'"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Page numbers -->
          <ng-container *ngIf="showPageNumbers">
            <!-- First page if not in visible range -->
            <button
              *ngIf="visiblePages[0] > 1"
              type="button"
              [class]="getButtonClasses('page', 1)"
              (click)="goToPage(1)"
              [attr.aria-label]="'Aller à la page 1'"
              [attr.aria-current]="1 === currentPage ? 'page' : null"
            >
              1
            </button>

            <!-- Ellipsis before visible pages -->
            <span
              *ngIf="visiblePages[0] > 2"
              [class]="ellipsisClasses"
            >
              ...
            </span>

            <!-- Visible page numbers -->
            <button
              *ngFor="let page of visiblePages"
              type="button"
              [class]="getButtonClasses('page', page)"
              (click)="goToPage(page)"
              [attr.aria-label]="'Aller à la page ' + page"
              [attr.aria-current]="page === currentPage ? 'page' : null"
            >
              {{ page }}
            </button>

            <!-- Ellipsis after visible pages -->
            <span
              *ngIf="visiblePages[visiblePages.length - 1] < totalPages - 1"
              [class]="ellipsisClasses"
            >
              ...
            </span>

            <!-- Last page if not in visible range -->
            <button
              *ngIf="visiblePages[visiblePages.length - 1] < totalPages"
              type="button"
              [class]="getButtonClasses('page', totalPages)"
              (click)="goToPage(totalPages)"
              [attr.aria-label]="'Aller à la page ' + totalPages"
              [attr.aria-current]="totalPages === currentPage ? 'page' : null"
            >
              {{ totalPages }}
            </button>
          </ng-container>

          <!-- Next page button -->
          <button
            *ngIf="showPrevNext"
            type="button"
            [class]="getButtonClasses('next')"
            [disabled]="currentPage === totalPages"
            (click)="goToNext()"
            [attr.aria-label]="'Aller à la page suivante'"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Last page button -->
          <button
            *ngIf="showFirstLast && currentPage < totalPages"
            type="button"
            [class]="getButtonClasses('last')"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(totalPages)"
            [attr.aria-label]="'Aller à la dernière page'"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm-6 0a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems?: number;
  @Input() itemsPerPage = 10;
  @Input() showFirstLast = true;
  @Input() showPrevNext = true;
  @Input() showPageNumbers = true;
  @Input() showInfo = true;
  @Input() maxVisiblePages = 5;
  @Input() size: PaginationSize = 'md';
  @Input() ariaLabel = 'Navigation de pagination';

  @Output() pageChange = new EventEmitter<number>();

  get startItem(): number {
    if (!this.totalItems) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    if (!this.totalItems) return 0;
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  get infoClasses(): string {
    const baseClasses = [
      'text-brand-dark-700',
      'dark:text-brand-dark-300'
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

  get ellipsisClasses(): string {
    const baseClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'border',
      'border-brand-dark-300',
      'bg-white',
      'text-brand-dark-500',
      'dark:border-brand-dark-600',
      'dark:bg-brand-dark-800',
      'dark:text-brand-dark-400'
    ];

    const sizeClasses = {
      sm: ['px-2', 'py-1', 'text-xs'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-6', 'py-3', 'text-base']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  getButtonClasses(type: 'first' | 'prev' | 'page' | 'next' | 'last', page?: number): string {
    const baseClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'border',
      'border-brand-dark-300',
      'bg-white',
      'font-medium',
      'text-brand-dark-500',
      'hover:bg-brand-dark-50',
      'focus:z-10',
      'focus:outline-none',
      'focus:ring-1',
      'focus:ring-brand-green-500',
      'focus:border-brand-green-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:hover:bg-white',
      'transition-colors',
      'duration-200',
      'dark:border-brand-dark-600',
      'dark:bg-brand-dark-800',
      'dark:text-brand-dark-300',
      'dark:hover:bg-brand-dark-700',
      'dark:disabled:hover:bg-brand-dark-800'
    ];

    const sizeClasses = {
      sm: ['px-2', 'py-1', 'text-xs'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-6', 'py-3', 'text-base']
    };

    // Current page styling
    const isCurrentPage = type === 'page' && page === this.currentPage;
    const currentPageClasses = isCurrentPage ? [
      '!bg-brand-green-50',
      '!border-brand-green-500',
      '!text-brand-green-600',
      '!z-10',
      'dark:!bg-brand-green-900',
      'dark:!border-brand-green-400',
      'dark:!text-brand-green-300'
    ] : [];

    // Border radius for first and last buttons
    const borderClasses = [];
    if (type === 'first' || (type === 'prev' && !this.showFirstLast)) {
      borderClasses.push('rounded-l-md');
    }
    if (type === 'last' || (type === 'next' && !this.showFirstLast)) {
      borderClasses.push('rounded-r-md');
    }

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...currentPageClasses,
      ...borderClasses
    ].join(' ');
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
}