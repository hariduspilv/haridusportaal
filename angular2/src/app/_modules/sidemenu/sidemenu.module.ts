import { NgModule } from '@angular/core';
import { MaterialModule } from '../../_shared/material.module';
import { SideMenuComponent } from './sidemenu.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule
  ],
  declarations: [
    SideMenuComponent
  ],
  exports: [
    SideMenuComponent
  ]
})

export class SideMenuModule {}
