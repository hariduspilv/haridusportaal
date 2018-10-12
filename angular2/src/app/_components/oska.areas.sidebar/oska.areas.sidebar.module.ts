import { NgModule} from '@angular/core';
import { OskaAreasSidebarComponent } from './oska.areas.sidebar.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/_core/material.module';
import { AppPipes } from '@app/_pipes';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/_core/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppPipes,
    RouterModule,
    SharedModule
  ],
  declarations: [
    OskaAreasSidebarComponent
  ],
  exports: [
    OskaAreasSidebarComponent
  ]
})

export class OskaAreasSidebarModule {}


