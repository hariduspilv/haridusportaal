import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../_core/material.module';
import { AppPipes } from '../../_pipes';
import { SharedModule } from '../../_core/shared.module';
import { NewsletterOrderComponent } from './newsletter.order.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { LoaderModule } from '../loader/loader.module';
@NgModule({
  imports: [
    CommonModule,
    AppPipes,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderModule
  ],
  declarations: [
    NewsletterOrderComponent,
  ],
  exports: [
    NewsletterOrderComponent
  ]
})

export class NewsletterOrderModule {}

