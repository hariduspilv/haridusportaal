import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { NgPipesModule } from 'ngx-pipes';
import { HomePageService } from './homePageView.service';
import { HomePageViewComponent } from './homePageView.component';
import { HomePageArticlesComponent } from './blocks/homePageView.articles.component';
import { HomePageCareerDevelopmentComponent } from './blocks/homePageView.careerDevelopment.component';
import { HomePageEventsComponent } from './blocks/homePageView.events.component';
import { HomePageFooterComponent } from './blocks/homePageView.footer.component';
import { HomePageLineComponent } from './blocks/homePageView.line.component';
import { HomePageNavBlockComponent } from './blocks/homePageView.navblock.component';
import { HomePageSlidesComponent } from './blocks/homePageView.slides.component';
import { HomePageSloganComponent } from './blocks/homePageView.slogan.component';
import { HomePageStudyComponent } from './blocks/homePageView.study.component';
import { HomePageTopicalComponent } from './blocks/homePageView.topical.component';
import { HomePageTeachingViewComponent } from './views/homePageView.teaching.component';
import { HomePageCareerViewComponent } from './views/homePageView.career.component';
import { HomePageLearningViewComponent } from './views/homePageView.learning.component';
import { HomePageYouthViewComponent } from './views/homePageView.youth.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageViewComponent,
  },
  {
    path: 'õpetaja',
    component: HomePageTeachingViewComponent,
    data: {
      theme: 'teachers',
    },
  },
  {
    path: 'karjäär',
    component: HomePageCareerViewComponent,
    data: {
      theme: 'career',
    },
  },
  {
    path: 'õppimine',
    component: HomePageLearningViewComponent,
    data: {
      theme: 'learning',
    },
  },
  {
    path: 'noored',
    component: HomePageYouthViewComponent,
    data: {
      theme: 'youth',
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
    HomePageTeachingViewComponent,
    HomePageCareerViewComponent,
    HomePageLearningViewComponent,
    HomePageYouthViewComponent,
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
    HomePageService,
  ],
  bootstrap: [],
})

export class HomePageViewModule { }
