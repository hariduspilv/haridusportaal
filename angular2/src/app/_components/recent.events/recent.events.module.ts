import { NgModule } from '@angular/core';
import { SharedModule } from '../../_core/shared.module';
import { RecentEventsComponent } from './recent.events.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../_core/material.module';
import { AppPipes } from '../../_pipes';
import { RouterModule, Routes } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppPipes,
    RouterModule,
    SharedModule
  ],
  declarations: [
   RecentEventsComponent
  ],
  exports: [
   RecentEventsComponent
  ]
})

export class RecentEventsModule {}

