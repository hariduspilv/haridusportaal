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
import { HomePageArticlesComponent } from './components/homepage-articles/homePageView.articles.component';
import { HomePageCareerDevelopmentComponent } from './components/homepage-career-development/homePageView.careerDevelopment.component';
import { HomePageEventsComponent } from './components/homepage-events/homePageView.events.component';
import { HomePageFooterComponent } from './components/homepage-footer/homePageView.footer.component';
import { HomePageLineComponent } from './components/homepage-line/homePageView.line.component';
import { HomePageNavBlockComponent } from './components/homepage-navblock/homePageView.navblock.component';
import { HomePageSlidesComponent } from './components/homepage-slides/homePageView.slides.component';
import { HomePageSloganComponent } from './components/homepage-slogan/homePageView.slogan.component';
import { HomePageStudyComponent } from './components/homepage-study/homePageView.study.component';
import { HomePageTopicalComponent } from './components/homepage-topical/homePageView.topical.component';
import { HomePageTeachingViewComponent } from './views/homePageView.teaching.component';
import { HomePageCareerViewComponent } from './views/homePageView.career.component';
import { HomePageLearningViewComponent } from './views/homePageView.learning.component';
import { HomePageYouthViewComponent } from './views/homePageView.youth.component';
import { JobOffersMapComponent } from './components/job-offers-map/job-offers-map.component';
import { JobOffersMapService } from './components/job-offers-map/job-offers-map.service';

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
    JobOffersMapComponent,
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
    JobOffersMapService,
  ],
  bootstrap: [],
})

export class HomePageViewModule { }
