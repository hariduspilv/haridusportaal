import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './_views/frontpage#FrontpageViewModule',
  },
  {
    path: 'uudised',
    loadChildren: './_views/newsListView#NewsListViewModule',
  },
  {
    path: 'uudised/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'news',
    },
  },
  {
    path: 'sündmused/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'event',
    },
  },
  {
    path: 'artiklid/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'article',
    },
  },
  {
    path: 'kool/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'school',
    },
  },
  {
    path: 'ametialad/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'profession',
    },
  },
  {
    path: 'valdkonnad/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'field',
    },
  },
  {
    path: 'oska-tulemused/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'resultPage',
    },
  },
  {
    path: 'tööjõuprognoos/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'surveyPage',
    },
  },
  {
    path: 'erialad/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'studyProgramme',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutesModule { }
