import { MoreBlockComponent } from './more.block.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/_core/shared.module';
import { CommonModule } from '@angular/common';
import { AppPipes } from '@app/_pipes';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    AppPipes,
  ],
  declarations: [
    MoreBlockComponent
  ],
  exports: [
    MoreBlockComponent,
  ]
})

export class MoreBlockModule {}