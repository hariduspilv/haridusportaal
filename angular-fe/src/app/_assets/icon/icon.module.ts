import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@app/_modules/translate';
import { IconComponent } from './icon.component';

@NgModule({
  declarations: [
    IconComponent,
  ],
  imports: [
    TranslateModule,
    CommonModule,
  ],
  exports: [
    IconComponent,
  ],
})
export class IconModule { }
