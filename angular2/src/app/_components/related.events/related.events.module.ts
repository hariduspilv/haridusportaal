import { NgModule } from '@angular/core';
import { RelatedEventsComponent } from './related.events.component';
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
   RelatedEventsComponent
  ],
  exports: [
   RelatedEventsComponent
  ]
})

export class RelatedEventsModule {}

