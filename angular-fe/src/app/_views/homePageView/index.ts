import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HomePageViewComponent,
  HomePageNavBlockComponent,
  HomePageArticlesComponent,
  HomePageSlidesComponent,
  HomePageLineComponent,
  HomePageTopicalComponent,
  HomePageStudyComponent,
  HomePageSloganComponent,
  HomePageFooterComponent,
} from './homePageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
const routes: Routes = [
  {
    path: '',
    component: HomePageViewComponent,
  },
];

@NgModule({
  declarations: [
    HomePageViewComponent,
    HomePageNavBlockComponent,
    HomePageArticlesComponent,
    HomePageSlidesComponent,
    HomePageLineComponent,
    HomePageTopicalComponent,
    HomePageStudyComponent,
    HomePageSloganComponent,
    HomePageFooterComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
  ],
  providers: [

  ],
  bootstrap: [],
})

export class HomePageViewModule { }
