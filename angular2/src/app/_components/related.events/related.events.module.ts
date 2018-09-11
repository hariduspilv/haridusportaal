import { NgModule } from '@angular/core';
import { RelatedEventsComponent } from './related.events.component';
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
   RelatedEventsComponent
  ],
  exports: [
   RelatedEventsComponent
  ]
})

export class RelatedEventsModule {}

