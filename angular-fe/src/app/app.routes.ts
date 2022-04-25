import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { AuthService } from './_services';
import { isLanguageCode, translateRoutes } from "@app/_core/router-utility";

@Component({
	selector: 'dummy-view',
	template: '',
})
export class DummyViewComponent {}

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./_views/homePageView').then(m => m.HomePageViewModule),
	},
	{
		path: 'tunnistused/lõpudokumendid',
		loadChildren: () => import('./modules/certificates/containers/certificates-container/certificates-container.module')
			.then(m => m.CertificatesContainerModule),
	},
	{
	  path: 'tunnistused/lõpudokumendid/:certificateNr/:accessorCode',
	  loadChildren: () => import('./modules/certificates/containers/certificates-detail/certificates-detail.module')
	    .then(m => m.CertificatesDetailModule),
	},
	{
	  path: 'tunnistused/lõpudokumendid/:id',
	  loadChildren: () => import('./modules/certificates/containers/certificates-detail/certificates-detail.module')
	  .then(m => m.CertificatesDetailModule),
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
	  path: 'search',
	  loadChildren: () => import('./modules/home-search/home-search.module').then(module => module.HomeSearchModule),
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
	  loadChildren: () => import('./modules/certificates/containers/certificates-check-detail/certificates-check-detail.module')
	    .then(m => m.CertificatesCheckDetailModule),
	},
	{
	  path: 'lõpudokumentide-kehtivuse-kontroll',
	  loadChildren: () => import('./modules/certificates/containers/certificates-document-check-detail/certificates-document-check-detail.module')
	    .then(m => m.CertificateDocumentCheckDetailModule),
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
	  loadChildren: () => import('./_views/digitalSignView').then(m => m.DigitalSignViewModule),
	  canActivate: [AuthService],
	},
	{
	  path: 'töölaud/tunnistused/lõputunnistused/:id',
	  canActivate: [AuthService],
	  loadChildren: () => import('./modules/certificates/containers/final-document-dashboard-detail/final-documents-dashboard-detail.module')
	  .then(m => m.FinalDocumentsDashboardDetailModule),
	},
	{
		path: 'uuringud',
		loadChildren: () => import('./modules/study/study.module').then(module => module.StudyModule),
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
	  path: ':id',
	  loadChildren: () => import('./_views/detailView').then(m => m.DetailViewModule),
	  data: {
	    type: 'article',
	  },
	},
	{
		path: '**',
		loadChildren: () => import('./_views/notFoundView').then(m => m.NotFoundViewModule),
	},
];

@NgModule({
	declarations: [DummyViewComponent],
	imports: [RouterModule.forRoot([
		{
			matcher: (url: UrlSegment[]) => {
				return isLanguageCode(url[0]?.path)
					? { consumed: url.slice(0, 1) }
					: { consumed: [] }
			},
			children: translateRoutes(routes, ['otsing', 'search', 'preview', 'dummy', 'oska']),
		},
	])],
	exports: [RouterModule],
})
export class RoutesModule {}
