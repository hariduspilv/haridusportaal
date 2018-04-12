import { NgModule } from '@angular/core';
import { MaterialModule } from '../../_core/material.module';
import { SideMenuComponent } from './sidemenu.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppDirectives } from '../../_directives';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    AppDirectives
  ],
  declarations: [
    SideMenuComponent
  ],
  exports: [
    SideMenuComponent
  ]
})

export class SideMenuModule {}
