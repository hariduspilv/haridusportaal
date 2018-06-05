import { NgModule } from '@angular/core';
import { RecentNewsComponent } from './recent.news.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../_core/material.module';
import { AppPipes } from '../../_pipes';
import { RouterModule, Routes } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppPipes,
    RouterModule
  ],
  declarations: [
    RecentNewsComponent
  ],
  exports: [
    RecentNewsComponent
  ]
})

export class RecentNewsModule {}

