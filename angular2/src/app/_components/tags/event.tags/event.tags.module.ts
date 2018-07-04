import { NgModule } from '@angular/core';
import { MaterialModule } from '../../../_core/material.module';
import { EventTagsComponent } from './event.tags.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppDirectives } from '../../../_directives';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    AppDirectives
  ],
  declarations: [
    EventTagsComponent
  ],
  exports: [
    EventTagsComponent
  ]
})

export class SideMenuModule {}
