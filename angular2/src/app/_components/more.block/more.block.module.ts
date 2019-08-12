import { MoreBlockComponent } from './more.block.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/_core/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
  ],
  declarations: [
    MoreBlockComponent
  ],
  exports: [
    MoreBlockComponent,
  ]
})

export class MoreBlockModule {}