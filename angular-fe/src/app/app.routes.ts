import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './_services';

const routes: Routes = [
  {
    path: '',
    loadChildren: './_views/frontpageView#FrontpageViewModule',
  },
  {
    path: 'oska',
    loadChildren: './_views/oskaFrontpageView#OskaFrontpageViewModule',
  },
  {
    path: 'töölaud',
    loadChildren: './_views/dashboardView#DashboardViewModule',
    canActivate: [AuthService],
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
    path: 'sündmused',
    loadChildren: './_views/eventsView#EventsViewModule',
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
    path: 'kool',
    loadChildren: './_views/schoolListView#SchoolListViewModule',
  },
  {
    path: 'kool/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'school',
    },
  },
  {
    path: 'ametialad',
    loadChildren: './_views/mainProfessionListView#MainProfessionListViewModule',
  },
  {
    path: 'ametialad/andmed',
    loadChildren: './_views/mainProfessionDataView#MainProfessionDataView',
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
    path: 'infosüsteemid',
    loadChildren: './_views/infoSystemView#InfoSystemViewModule',
  },
  {
    path: 'erialad',
    loadChildren: './_views/studyProgrammeListView#StudyProgrammeListViewModule',
  },
  {
    path: 'erialad/:id',
    loadChildren: './_views/detailView#DetailViewModule',
    data: {
      type: 'studyProgramme',
    },
  },
  {
    path: 'tunnistuse-kehtivuse-kontroll',
    loadChildren: './_views/certificateCheckView#CertificateCheckViewModule',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutesModule { }
