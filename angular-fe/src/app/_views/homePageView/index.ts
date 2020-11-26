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

const routes: Routes = [
  {
    path: '',
    component: HomePageViewComponent,
  },
  {
    path: 'opetaja',
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
