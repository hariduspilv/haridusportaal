import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress.bar.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '@app/_core/shared.module';


@NgModule({
  providers: [],
  imports: [
    RouterModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    ProgressBarComponent
  ],
  exports: [
    ProgressBarComponent
  ]
})

export class ProgressBarModule {}