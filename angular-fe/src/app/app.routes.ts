import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './_services';

@Component({
  selector: 'dummy-view',
  template: '',
})
export class DummyViewComponent {}

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./_views/frontpageView').then(m => m.FrontpageViewModule),
  },
  {
    path: 'oska',
    loadChildren: () => import('./_views/oskaFrontpageView').then(m => m.OskaFrontpageViewModule),
  },
  {
    path: 'töölaud',
    loadChildren: () => import('./_views/dashboardView').then(m => m.DashboardViewModule),
    canActivate: [AuthService],
    data: {
      type: 'dashboard',
    },
  },
  {
    path: 'uudised',
    loadChildren: () => import('./_views/newsListView').then(m => m.NewsListViewModule),

  },
  {
    path: 'otsing',
    loadChildren: () => import('./_views/homeSearchListView').then(m => m.HomeSearchListViewModule),

  },
  {
    path: 'uudised/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'news',
    },
  },
  {
    path: 'sündmused',
    loadChildren: () => import('./_views/eventsView').then(m => m.EventsViewModule),
  },
  {
    path: 'sündmused/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'event',
    },
  },
  {
    path: 'artiklid/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'article',
    },
  },
  {
    path: 'kool',
    loadChildren: () => import('./_views/schoolListView').then(m => m.SchoolListViewModule),
  },
  {
    path: 'kool/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'school',
    },
  },
  {
    path: 'koolide-rahastus',
    loadChildren: () => import('./_views/schoolFunding').then(m => m.SchoolFundingViewModule),
  },
  {
    path: 'ametialad',
    loadChildren: () => import('./_views/mainProfessionListView')
      .then(m => m.MainProfessionListViewModule),
  },
  {
    path: 'ametialad/võrdlus',
    loadChildren: () => import('./_views/compareView').then(m => m.CompareViewModule),
    data: {
      type: 'oskaProfessionsComparison',
      query: 'oskaMainProfessionListView',
    },
  },
  {
    path: 'ametialad/andmed',
    loadChildren: () => import('./_views/mainProfessionDataView')
      .then(m => m.MainProfessionDataView),
  },
  {
    path: 'ametialad/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'profession',
    },
  },
  {
    path: 'valdkonnad',
    loadChildren: () => import('./_views/oskaFieldListView').then(m => m.OskaFieldListViewModule),
  },
  {
    path: 'valdkonnad/andmed',
    loadChildren: () => import('./_views/oskaFieldDataView').then(m => m.OskaFieldDataView),
  },
  {
    path: 'valdkonnad/kaart',
    loadChildren: () => import('./_views/oskaFieldMap').then(m => m.OskaFieldMapModule),
  },
  {
    path: 'valdkonnad/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'field',
    },
  },
  {
    path: 'oska-tulemused/ettepanekute-elluviimine',
    loadChildren: () => import('./_views/oskaResultsView').then(m => m.OskaResultsViewModule),
  },
  {
    path: 'oska-tulemused/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'resultPage',
    },
  },
  {
    path: 'tööjõuprognoos/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'surveyPage',
    },
  },
  {
    path: 'infosüsteemid',
    loadChildren: () => import('./_views/infoSystemView').then(m => m.InfoSystemViewModule),
    data: {
      type: 'infosystem',
    },
  },
  {
    path: 'erialad',
    loadChildren: () => import('./_views/studyProgrammeListView')
      .then(m => m.StudyProgrammeListViewModule),
  },
  {
    path: 'erialad/võrdlus',
    loadChildren: () => import('./_views/compareView').then(m => m.CompareViewModule),
    data: {
      type: 'studyProgrammeComparison',
      query: 'studyProgrammeComparison',
    },
  },
  {
    path: 'erialad/:id',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      type: 'studyProgramme',
    },
  },
  {
    path: 'tunnistuse-kehtivuse-kontroll',
    loadChildren: () => import('./_views/certificateCheckView')
      .then(m => m.CertificateCheckViewModule),
  },
  {
    path: 'lõpudokumentide-kehtivuse-kontroll',
    loadChildren: () => import('./_views/documentCheckView')
      .then(m => m.DocumentCheckViewModule),
  },
  {
    path: 'töölaud/taotlused/:id',
    loadChildren: () => import('./_views/xjson').then(m => m.XjsonModule),
    canActivate: [AuthService],
  },
  {
    path: 'töölaud/teavitused',
    loadChildren: () => import('./_views/messagesView').then(m => m.MessagesViewModule),
    canActivate: [AuthService],
  },
  {
    path: 'töölaud/gdpr',
    loadChildren: () => import('./_views/gdprView').then(m => m.GdprViewModule),
    canActivate: [AuthService],
  },
  {
    path: 'töölaud/digitempel',
    loadChildren: () => import('./_views/digitalSign').then(m => m.DigitalSignModule),
    canActivate: [AuthService],
  },
  {
    path: 'preview',
    loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
    data: {
      preview: true,
    },
  },
  {
    path: 'dummy',
    component: DummyViewComponent,
  },
  {
    path: '**',
    loadChildren: () => import('./_views/notFoundView').then(m => m.NotFoundViewModule),
  },
];

@NgModule({
  declarations: [DummyViewComponent],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutesModule { }
