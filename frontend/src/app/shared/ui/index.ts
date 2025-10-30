// Import components first
import { ButtonComponent, type ButtonVariant, type ButtonSize } from './button.component';
import { InputComponent, type InputSize, type InputType } from './input.component';
import { TextareaComponent, type TextareaSize, type TextareaResize } from './textarea.component';
import { CardComponent, type CardVariant, type CardSize } from './card.component';
import { AlertComponent, type AlertType, type AlertSize } from './alert.component';
import { SpinnerComponent, type SpinnerSize, type SpinnerVariant } from './spinner.component';
import { ModalComponent, type ModalSize, type ModalPosition } from './modal';
import { PaginationComponent, type PaginationSize, type PaginationConfig } from './pagination.component';
import { BreadcrumbComponent, type BreadcrumbSize, type BreadcrumbSeparator, type BreadcrumbItem } from './breadcrumb.component';
import { AccordionComponent, type AccordionSize, type AccordionVariant, type AccordionItem } from './accordion.component';

// Export all UI components
export { ButtonComponent, type ButtonVariant, type ButtonSize } from './button.component';
export { InputComponent, type InputSize, type InputType } from './input.component';
export { TextareaComponent, type TextareaSize, type TextareaResize } from './textarea.component';
export { CardComponent, type CardVariant, type CardSize } from './card.component';
export { AlertComponent, type AlertType, type AlertSize } from './alert.component';
export { SpinnerComponent, type SpinnerSize, type SpinnerVariant } from './spinner.component';
export { ModalComponent, type ModalSize, type ModalPosition } from './modal';
export { PaginationComponent, type PaginationSize, type PaginationConfig } from './pagination.component';
export { BreadcrumbComponent, type BreadcrumbSize, type BreadcrumbSeparator, type BreadcrumbItem } from './breadcrumb.component';
export { AccordionComponent, type AccordionSize, type AccordionVariant, type AccordionItem } from './accordion.component';

// Export modal service
export { ModalService, ConfirmationModalService, type ModalConfig, type ModalRef } from './modal';

// UI Components array for easy module imports
export const UI_COMPONENTS = [
  ButtonComponent,
  InputComponent,
  TextareaComponent,
  CardComponent,
  AlertComponent,
  SpinnerComponent,
  ModalComponent,
  PaginationComponent,
  BreadcrumbComponent,
  AccordionComponent
] as const;