import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UiModule } from './ui/ui.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UiModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UiModule
  ]
})
export class SharedModule { }