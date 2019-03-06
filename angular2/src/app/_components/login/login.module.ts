import { NgModule } from '@angular/core';
import { MaterialModule } from '@app/_core/material.module';
import { LoginComponent } from './login.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '@app/_core/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LabeledSeparatorModule } from '@app/_components/labeled.separator/labeled.separator.module';


@NgModule({
  providers: [],
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    LabeledSeparatorModule
  ],
  declarations: [
    LoginComponent
  ],
  exports: [
    LoginComponent
  ]
})

export class LoginModule {}