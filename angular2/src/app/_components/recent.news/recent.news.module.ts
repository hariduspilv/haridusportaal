import { NgModule} from '@angular/core';
import { RecentNewsComponent } from './recent.news.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/_core/material.module';
import { AppPipes } from '@app/_pipes';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/_core/shared.module';
import { LoaderModule } from '@app/_components/loader/loader.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppPipes,
    RouterModule,
    SharedModule,
    LoaderModule
  ],
  declarations: [
    RecentNewsComponent
  ],
  exports: [
    RecentNewsComponent
  ]
})

export class RecentNewsModule {}

