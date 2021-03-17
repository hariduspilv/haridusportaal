import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@app/_modules/translate';
import { BaseLayout } from './baseLayout.component';

@NgModule({
  declarations: [
    BaseLayout,
  ],
  imports: [
    TranslateModule,
    CommonModule,
  ],
  exports: [
    BaseLayout,
  ],
})
export class BaseLayoutModule { }
