import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleComponent, FrontpageComponent, EventsComponent, PersonalDataComponent, EventsSingleComponent, NewsComponent, NewsSingleComponent } from './_views';

const appRoutes: Routes = [
  { path: ':lang/artiklid/:id', component: ArticleComponent },
  { path: ':lang/articles/:id', component: ArticleComponent },
  { path: ':lang/events', component: EventsComponent },
  { path: ':lang/events/:id', component: EventsSingleComponent },
  { path: ':lang/news', component: NewsComponent },
  { path: ':lang/news/:id', component: NewsSingleComponent },
  { path: ':lang/uudised', component: NewsComponent },
  { path: ':lang/uudised/:id', component: NewsSingleComponent },
  { path: ':lang/sundmused', component: EventsComponent },
  { path: ':lang/sundmused/:id', component: EventsSingleComponent },
  { path: ':lang', component: FrontpageComponent },

  { path: ':lang/isikukaart', component: PersonalDataComponent },
  { path: '**', redirectTo: '/et', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [
  ArticleComponent,
  FrontpageComponent,
  EventsComponent,
  EventsSingleComponent,
  PersonalDataComponent,
  NewsComponent,
  NewsSingleComponent
];

