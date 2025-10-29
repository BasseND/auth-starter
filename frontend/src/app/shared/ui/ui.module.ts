import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  ButtonComponent,
  InputComponent,
  CardComponent,
  AlertComponent,
  SpinnerComponent,
  UI_COMPONENTS
} from './index';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ...UI_COMPONENTS
  ],
  exports: [
    ...UI_COMPONENTS
  ]
})
export class UiModule { }