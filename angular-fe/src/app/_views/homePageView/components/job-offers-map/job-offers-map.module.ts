import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { NgPipesModule } from 'ngx-pipes';
import { JobOffersMapComponent } from './job-offers-map/job-offers-map.component';
import { JobOffersMapService } from './job-offers-map.service';

const components = [
  JobOffersMapComponent
]

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
    ReactiveFormsModule,
    NgPipesModule,
  ],
  providers: [
    JobOffersMapService,
  ]
})

export class JobOffersMapModule { }
