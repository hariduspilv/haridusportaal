import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress.bar.component';
import { SharedModule } from '@app/_core/shared.module';


@NgModule({
  providers: [],
  imports: [
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