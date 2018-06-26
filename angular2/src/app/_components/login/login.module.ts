import { NgModule } from '@angular/core';
import { MaterialModule } from '../../_core/material.module';
import { LoginComponent } from './login.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../_core/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'


@NgModule({
  providers: [],
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    LoginComponent
  ],
  exports: [
    LoginComponent
  ]
})

export class LoginModule {}