import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() size: ModalSize = 'md';
  @Input() position: ModalPosition = 'center';
  @Input() showCloseButton = true;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() closeButtonLabel = 'Fermer';
  @Input() preventBodyScroll = true;

  @Output() modalClose = new EventEmitter<void>();
  @Output() modalOpen = new EventEmitter<void>();

  @ViewChild('modalPanel', { static: false }) modalPanel!: ElementRef<HTMLElement>;

  private focusableElements: HTMLElement[] = [];
  private previousActiveElement: HTMLElement | null = null;
  private currentFocusIndex = 0;

  readonly titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  readonly descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  get containerClasses(): string {
    const classes = [];
    
    if (this.position === 'top') {
      classes.push('items-start pt-16');
    } else {
      classes.push('items-center');
    }
    
    return classes.join(' ');
  }

  get modalClasses(): string {
    const classes = [];
    
    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push('max-w-sm');
        break;
      case 'md':
        classes.push('max-w-md');
        break;
      case 'lg':
        classes.push('max-w-lg');
        break;
      case 'xl':
        classes.push('max-w-2xl');
        break;
      case 'full':
        classes.push('max-w-full mx-4');
        break;
    }
    
    return classes.join(' ');
  }

  get bodyClasses(): string {
    const classes = [];
    
    if (!this.hasHeader && !this.hasFooter) {
      classes.push('rounded-lg');
    } else if (!this.hasHeader) {
      classes.push('rounded-t-lg');
    } else if (!this.hasFooter) {
      classes.push('rounded-b-lg');
    }
    
    return classes.join(' ');
  }

  ngOnInit() {
    if (this.isOpen) {
      this.handleOpen();
    }
  }

  ngAfterViewInit() {
    if (this.isOpen) {
      this.setupFocusTrap();
    }
  }

  ngOnDestroy() {
    this.handleClose();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (this.closeOnEscape) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  }

  open() {
    this.isOpen = true;
    this.handleOpen();
    this.modalOpen.emit();
    
    // Setup focus trap after view is updated
    setTimeout(() => {
      this.setupFocusTrap();
    });
  }

  close() {
    this.isOpen = false;
    this.handleClose();
    this.modalClose.emit();
  }

  onBackdropClick() {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.showCloseButton);
  }

  get hasFooter(): boolean {
    // This will be true if there's content projected into the footer slot
    return true; // Simplified for now
  }

  get headerClasses(): string {
    return '';
  }

  get footerClasses(): string {
    return '';
  }

  private handleOpen() {
    if (this.preventBodyScroll) {
      document.body.style.overflow = 'hidden';
    }
    
    // Store the currently focused element
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  private handleClose() {
    if (this.preventBodyScroll) {
      document.body.style.overflow = '';
    }
    
    // Restore focus to the previously focused element
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  private setupFocusTrap() {
    if (!this.modalPanel) return;

    // Find all focusable elements within the modal
    this.focusableElements = this.getFocusableElements();
    
    if (this.focusableElements.length > 0) {
      // Focus the first focusable element
      this.focusableElements[0].focus();
      this.currentFocusIndex = 0;
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(
      this.modalPanel.nativeElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  private handleTabKey(event: KeyboardEvent) {
    if (this.focusableElements.length === 0) return;

    const isShiftTab = event.shiftKey;
    
    if (isShiftTab) {
      // Shift + Tab (backward)
      if (this.currentFocusIndex <= 0) {
        // Wrap to last element
        this.currentFocusIndex = this.focusableElements.length - 1;
      } else {
        this.currentFocusIndex--;
      }
    } else {
      // Tab (forward)
      if (this.currentFocusIndex >= this.focusableElements.length - 1) {
        // Wrap to first element
        this.currentFocusIndex = 0;
      } else {
        this.currentFocusIndex++;
      }
    }

    event.preventDefault();
    this.focusableElements[this.currentFocusIndex].focus();
  }
}