import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionVariant = 'default' | 'bordered' | 'filled' | 'minimal';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
  expanded?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: 0
      })),
      state('expanded', style({
        height: '*',
        overflow: 'visible',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('iconRotate', [
      state('collapsed', style({
        transform: 'rotate(0deg)'
      })),
      state('expanded', style({
        transform: 'rotate(180deg)'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ],
  template: `
    <div [class]="containerClasses" role="region" [attr.aria-label]="ariaLabel">
      <div *ngFor="let item of items; let i = index; trackBy: trackByFn" [class]="itemClasses">
        <!-- Accordion Header -->
        <h3>
          <button
            type="button"
            [class]="getHeaderClasses(item)"
            [disabled]="item.disabled"
            [attr.aria-expanded]="item.expanded"
            [attr.aria-controls]="'accordion-content-' + item.id"
            [attr.id]="'accordion-header-' + item.id"
            (click)="toggle(item, i)"
            (keydown)="onKeyDown($event, item, i)"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <!-- Custom icon -->
                <i *ngIf="item.icon" [class]="item.icon + ' ' + customIconClasses"></i>
                
                <!-- Title -->
                <span [class]="titleClasses">{{ item.title }}</span>
              </div>
              
              <!-- Expand/Collapse icon -->
              <svg
                [class]="expandIconClasses"
                [@iconRotate]="item.expanded ? 'expanded' : 'collapsed'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </h3>

        <!-- Accordion Content -->
        <div
          [attr.id]="'accordion-content-' + item.id"
          [attr.aria-labelledby]="'accordion-header-' + item.id"
          [@expandCollapse]="item.expanded ? 'expanded' : 'collapsed'"
          role="region"
        >
          <div [class]="contentClasses">
            <div [innerHTML]="item.content"></div>
            
            <!-- Content slot for custom content -->
            <ng-content [select]="'[slot=content-' + item.id + ']'"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccordionComponent implements OnInit {
  @Input() items: AccordionItem[] = [];
  @Input() allowMultiple = false;
  @Input() size: AccordionSize = 'md';
  @Input() variant: AccordionVariant = 'default';
  @Input() ariaLabel = 'Accordion';

  @Output() itemToggle = new EventEmitter<{ item: AccordionItem; index: number; expanded: boolean }>();
  @Output() itemExpanded = new EventEmitter<{ item: AccordionItem; index: number }>();
  @Output() itemCollapsed = new EventEmitter<{ item: AccordionItem; index: number }>();

  ngOnInit(): void {
    // Initialize expanded state if not set
    this.items.forEach(item => {
      if (item.expanded === undefined) {
        item.expanded = false;
      }
    });
  }

  get containerClasses(): string {
    const baseClasses = [
      'w-full'
    ];

    const variantClasses = {
      default: ['space-y-1'],
      bordered: ['border', 'border-brand-dark-200', 'rounded-lg', 'overflow-hidden', 'dark:border-brand-dark-700'],
      filled: ['bg-brand-dark-50', 'rounded-lg', 'overflow-hidden', 'dark:bg-brand-dark-800'],
      minimal: ['space-y-0']
    };

    return [
      ...baseClasses,
      ...variantClasses[this.variant]
    ].join(' ');
  }

  get itemClasses(): string {
    const baseClasses: string[] = [];

    const variantClasses = {
      default: ['border', 'border-brand-dark-200', 'rounded-lg', 'overflow-hidden', 'dark:border-brand-dark-700'],
      bordered: ['border-b', 'border-brand-dark-200', 'last:border-b-0', 'dark:border-brand-dark-700'],
      filled: ['border-b', 'border-brand-dark-200', 'last:border-b-0', 'dark:border-brand-dark-700'],
      minimal: ['border-b', 'border-brand-dark-100', 'last:border-b-0', 'dark:border-brand-dark-800']
    };

    return [
      ...baseClasses,
      ...variantClasses[this.variant]
    ].join(' ');
  }

  get customIconClasses(): string {
    const sizeClasses = {
      sm: ['h-4', 'w-4', 'mr-2'],
      md: ['h-5', 'w-5', 'mr-3'],
      lg: ['h-6', 'w-6', 'mr-3']
    };

    return [
      'text-brand-dark-500',
      'dark:text-brand-dark-400',
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get titleClasses(): string {
    const baseClasses = [
      'text-left',
      'font-medium'
    ];

    const sizeClasses = {
      sm: ['text-sm'],
      md: ['text-base'],
      lg: ['text-lg']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get expandIconClasses(): string {
    const baseClasses = [
      'flex-shrink-0',
      'transition-transform',
      'duration-300'
    ];

    const sizeClasses = {
      sm: ['h-4', 'w-4'],
      md: ['h-5', 'w-5'],
      lg: ['h-6', 'w-6']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size]
    ].join(' ');
  }

  get contentClasses(): string {
    const baseClasses = [
      'text-brand-dark-700',
      'dark:text-brand-dark-300'
    ];

    const sizeClasses = {
      sm: ['p-3', 'text-sm'],
      md: ['p-4', 'text-base'],
      lg: ['p-6', 'text-lg']
    };

    const variantClasses = {
      default: ['bg-white', 'dark:bg-brand-dark-900'],
      bordered: ['bg-white', 'dark:bg-brand-dark-900'],
      filled: ['bg-brand-dark-25', 'dark:bg-brand-dark-750'],
      minimal: ['bg-transparent']
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ].join(' ');
  }

  getHeaderClasses(item: AccordionItem): string {
    const baseClasses = [
      'flex',
      'w-full',
      'text-left',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-brand-green-500',
      'focus:ring-offset-2',
      'transition-colors',
      'duration-200',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ];

    const sizeClasses = {
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-6']
    };

    const variantClasses = {
      default: [
        'bg-white',
        'hover:bg-brand-dark-50',
        'text-brand-dark-900',
        'dark:bg-brand-dark-900',
        'dark:hover:bg-brand-dark-800',
        'dark:text-brand-dark-100'
      ],
      bordered: [
        'bg-white',
        'hover:bg-brand-dark-50',
        'text-brand-dark-900',
        'dark:bg-brand-dark-900',
        'dark:hover:bg-brand-dark-800',
        'dark:text-brand-dark-100'
      ],
      filled: [
        'bg-brand-dark-100',
        'hover:bg-brand-dark-150',
        'text-brand-dark-900',
        'dark:bg-brand-dark-700',
        'dark:hover:bg-brand-dark-600',
        'dark:text-brand-dark-100'
      ],
      minimal: [
        'bg-transparent',
        'hover:bg-brand-dark-50',
        'text-brand-dark-700',
        'dark:hover:bg-brand-dark-800',
        'dark:text-brand-dark-300'
      ]
    };

    const expandedClasses = item.expanded ? [
      'border-b',
      'border-brand-dark-200',
      'dark:border-brand-dark-700'
    ] : [];

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant],
      ...expandedClasses
    ].join(' ');
  }

  toggle(item: AccordionItem, index: number): void {
    if (item.disabled) return;

    const wasExpanded = item.expanded;

    if (!this.allowMultiple && !wasExpanded) {
      // Collapse all other items
      this.items.forEach((otherItem, otherIndex) => {
        if (otherIndex !== index && otherItem.expanded) {
          otherItem.expanded = false;
          this.itemCollapsed.emit({ item: otherItem, index: otherIndex });
        }
      });
    }

    // Toggle current item
    item.expanded = !wasExpanded;

    // Emit events
    this.itemToggle.emit({ item, index, expanded: item.expanded });
    
    if (item.expanded) {
      this.itemExpanded.emit({ item, index });
    } else {
      this.itemCollapsed.emit({ item, index });
    }
  }

  onKeyDown(event: KeyboardEvent, item: AccordionItem, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle(item, index);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(index);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(index);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  private focusNextItem(currentIndex: number): void {
    const nextIndex = (currentIndex + 1) % this.items.length;
    this.focusItem(nextIndex);
  }

  private focusPreviousItem(currentIndex: number): void {
    const prevIndex = currentIndex === 0 ? this.items.length - 1 : currentIndex - 1;
    this.focusItem(prevIndex);
  }

  private focusFirstItem(): void {
    this.focusItem(0);
  }

  private focusLastItem(): void {
    this.focusItem(this.items.length - 1);
  }

  private focusItem(index: number): void {
    const item = this.items[index];
    if (item && !item.disabled) {
      const button = document.getElementById(`accordion-header-${item.id}`);
      button?.focus();
    }
  }

  expandAll(): void {
    if (this.allowMultiple) {
      this.items.forEach((item, index) => {
        if (!item.disabled && !item.expanded) {
          item.expanded = true;
          this.itemExpanded.emit({ item, index });
        }
      });
    }
  }

  collapseAll(): void {
    this.items.forEach((item, index) => {
      if (!item.disabled && item.expanded) {
        item.expanded = false;
        this.itemCollapsed.emit({ item, index });
      }
    });
  }

  trackByFn(index: number, item: AccordionItem): string {
    return item.id;
  }
}