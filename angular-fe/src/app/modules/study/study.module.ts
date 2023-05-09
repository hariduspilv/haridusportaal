import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsModule } from '@app/_assets';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AuthInterceptor } from '@app/_interceptors';
import { TranslateModule } from '@app/_modules/translate';
import { StudyListItemComponent } from './components/study-list-item/study-list-item.component';
import { StudyListComponent } from './containers/study-list/study-list.component';
import { StudyListItemInlineElementsComponent } from './components/study-list-item-inline-elements/study-list-item-inline-elements.component';
import { StudyListFilterComponent } from './components/study-list-filter/study-list-filter.component';
import { StudyDetailComponent } from './containers/study-detail/study-detail.component';
import { RouteUndefinedInterceptor } from '@app/_interceptors/detail-route-undefined.interceptor';
import { StudySidebarComponent } from './containers/study-sidebar/study-sidebar.component';
import { StudySidebarAdditionalLinksComponent } from './components/study-sidebar-additional-links/study-sidebar-additional-links.component';
import { StudySidebarStudyDataComponent } from './components/study-sidebar-study-data/study-sidebar-study-data.component';
import { StudySidebarStudyDataListItemComponent } from './components/study-sidebar-study-data-list-item/study-sidebar-study-data-list-item.component';
import { StudyIntroComponent } from './components/study-intro/study-intro.component';
import { translateRoutes } from '@app/_core/router-utility';
import { AppPipes } from '@app/_pipes';
import { DedrupalizeInterceptor } from '@app/_interceptors/dedrupalize.interceptor';

const routes: Routes = [
	{
		path: '',
		component: StudyListComponent,
	},
	{
		path: ':id',
		component: StudyDetailComponent,
	},
];

@NgModule({
	declarations: [
		StudyListItemComponent,
		StudyListComponent,
		StudyListItemInlineElementsComponent,
		StudyListFilterComponent,
		StudyDetailComponent,
		StudySidebarComponent,
		StudySidebarStudyDataComponent,
		StudySidebarAdditionalLinksComponent,
		StudySidebarStudyDataListItemComponent,
		StudyIntroComponent,
	],
	imports: [
		CommonModule,
		AssetsModule,
		TranslateModule,
		RouterModule.forChild(translateRoutes(routes)),
		FormsModule,
		AppPipes,
	],
	exports: [],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: RouteUndefinedInterceptor,
			multi: true,
		},
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: DedrupalizeInterceptor,
			multi: true,
		},
	],
})
export class StudyModule {}
