import { Injectable, ComponentRef, ViewContainerRef, Type, inject } from '@angular/core';
import { ModalComponent, ModalSize, ModalPosition } from './modal.component';
import { Subject, Observable } from 'rxjs';

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  closeButtonLabel?: string;
  preventBodyScroll?: boolean;
  data?: any;
}

export interface ModalRef<T = any> {
  componentInstance: T;
  modalInstance: ModalComponent;
  afterClosed: Observable<any>;
  close: (result?: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private openModals: ComponentRef<any>[] = [];
  private viewContainerRef?: ViewContainerRef;

  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  open<T extends object>(
    component: Type<T>, 
    config: ModalConfig = {}
  ): ModalRef<T> {
    if (!this.viewContainerRef) {
      throw new Error('ViewContainerRef not set. Call setViewContainerRef() first.');
    }

    // Create the modal component
    const modalComponentRef = this.viewContainerRef.createComponent(ModalComponent);
    const modalInstance = modalComponentRef.instance;

    // Configure the modal
    this.configureModal(modalInstance, config);

    // Create the content component
    const contentComponentRef = this.viewContainerRef.createComponent(component);
    const contentInstance = contentComponentRef.instance;

    // Pass data to content component if it has a data property
    if (config.data && 'data' in contentInstance) {
      (contentInstance as any).data = config.data;
    }

    // Create afterClosed subject
    const afterClosedSubject = new Subject<any>();

    // Setup modal close handling
    const closeHandler = (result?: any) => {
      modalInstance.close();
      setTimeout(() => {
        // Remove from open modals array
        const index = this.openModals.indexOf(modalComponentRef);
        if (index > -1) {
          this.openModals.splice(index, 1);
        }

        // Destroy components
        contentComponentRef.destroy();
        modalComponentRef.destroy();

        // Emit result and complete
        afterClosedSubject.next(result);
        afterClosedSubject.complete();
      }, 300); // Wait for close animation
    };

    // Subscribe to modal close event
    modalInstance.modalClose.subscribe(() => {
      closeHandler();
    });

    // Add to open modals array
    this.openModals.push(modalComponentRef);

    // Open the modal
    modalInstance.open();

    // Return modal reference
    return {
      componentInstance: contentInstance,
      modalInstance,
      afterClosed: afterClosedSubject.asObservable(),
      close: closeHandler
    };
  }

  closeAll(): void {
    this.openModals.forEach(modalRef => {
      modalRef.instance.close();
    });
  }

  getOpenModalsCount(): number {
    return this.openModals.length;
  }

  private configureModal(modalInstance: ModalComponent, config: ModalConfig): void {
    if (config.title !== undefined) modalInstance.title = config.title;
    if (config.subtitle !== undefined) modalInstance.subtitle = config.subtitle;
    if (config.size !== undefined) modalInstance.size = config.size;
    if (config.position !== undefined) modalInstance.position = config.position;
    if (config.showCloseButton !== undefined) modalInstance.showCloseButton = config.showCloseButton;
    if (config.closeOnBackdropClick !== undefined) modalInstance.closeOnBackdropClick = config.closeOnBackdropClick;
    if (config.closeOnEscape !== undefined) modalInstance.closeOnEscape = config.closeOnEscape;
    if (config.closeButtonLabel !== undefined) modalInstance.closeButtonLabel = config.closeButtonLabel;
    if (config.preventBodyScroll !== undefined) modalInstance.preventBodyScroll = config.preventBodyScroll;
  }
}

// Confirmation Modal Component
@Injectable()
export class ConfirmationModalService {
  constructor(private modalService: ModalService) {}

  confirm(
    title: string,
    message: string,
    confirmText = 'Confirmer',
    cancelText = 'Annuler'
  ): Observable<boolean> {
    const subject = new Subject<boolean>();

    // Create a simple confirmation component inline
    const confirmationComponent = class {
      title = title;
      message = message;
      confirmText = confirmText;
      cancelText = cancelText;
      
      onConfirm?: () => void;
      onCancel?: () => void;
    };

    const modalRef = this.modalService.open(confirmationComponent, {
      title,
      size: 'sm',
      showCloseButton: false,
      closeOnBackdropClick: false,
      closeOnEscape: true
    });

    // Setup handlers
    modalRef.componentInstance.onConfirm = () => {
      subject.next(true);
      subject.complete();
      modalRef.close(true);
    };

    modalRef.componentInstance.onCancel = () => {
      subject.next(false);
      subject.complete();
      modalRef.close(false);
    };

    return subject.asObservable();
  }
}