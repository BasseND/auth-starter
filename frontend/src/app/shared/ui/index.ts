// Import components first
import { ButtonComponent, type ButtonVariant, type ButtonSize } from './button.component';
import { InputComponent, type InputSize, type InputType } from './input.component';
import { CardComponent, type CardVariant, type CardSize } from './card.component';
import { AlertComponent, type AlertType, type AlertSize } from './alert.component';
import { SpinnerComponent, type SpinnerSize, type SpinnerVariant } from './spinner.component';

// Export all UI components
export { ButtonComponent, type ButtonVariant, type ButtonSize } from './button.component';
export { InputComponent, type InputSize, type InputType } from './input.component';
export { CardComponent, type CardVariant, type CardSize } from './card.component';
export { AlertComponent, type AlertType, type AlertSize } from './alert.component';
export { SpinnerComponent, type SpinnerSize, type SpinnerVariant } from './spinner.component';

// UI Components array for easy module imports
export const UI_COMPONENTS = [
  ButtonComponent,
  InputComponent,
  CardComponent,
  AlertComponent,
  SpinnerComponent
] as const;