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
  HomePageEventsComponent,
  HomePageCareerDevelopmentComponent,
} from './homePageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { NgPipesModule } from 'ngx-pipes';

const routes: Routes = [
  {
    path: '',
    component: HomePageViewComponent,
  },
  {
    path: 'õpetaja',
    component: HomePageViewComponent,
    data: {
      theme: 'teachers',
    },
  },
  {
    path: 'karjäär',
    component: HomePageViewComponent,
    data: {
      theme: 'career',
    },
  },
  {
    path: 'oska',
    redirectTo: 'karjäär',
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
    HomePageEventsComponent,
    HomePageCareerDevelopmentComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
    ReactiveFormsModule,
    NgPipesModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [],
})

export class HomePageViewModule { }
