import { MoreBlockComponent } from './more.block.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPipes } from '@app/_pipes';

@NgModule({
  imports: [
    CommonModule,
    AppPipes,
  ],
  declarations: [
    MoreBlockComponent,
  ],
  exports: [
    MoreBlockComponent,
  ]
})

export class MoreBlockModule { }