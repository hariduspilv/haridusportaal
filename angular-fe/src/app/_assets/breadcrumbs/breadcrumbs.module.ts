import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@app/_modules/translate';
import { IconModule } from '../icon/icon.module';
import { BreadcrumbsComponent } from './breadcrumbs.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
  ],
  imports: [
    IconModule,
    RouterModule,
    TranslateModule,
    CommonModule,
  ],
  exports: [
    BreadcrumbsComponent,
  ],
})
export class BreadcrumbsModule { }
