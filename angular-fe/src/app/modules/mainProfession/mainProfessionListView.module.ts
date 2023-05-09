import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { MainProfessionListViewComponent } from './containers/mainProfessionListView/mainProfessionListView.component';
import { AppPipes } from '@app/_pipes';
import { translateRoutes } from '@app/_core/router-utility';
import { DedrupalizeInterceptor } from '@app/_interceptors/dedrupalize.interceptor';
import { MainProfessionsSearchResultsComponent } from './containers/mainProfessionsSearchResults/mainProfessionsSearchResults.component';
import { MainProfessionDataViewComponent } from './containers/mainProfessionDataView/mainProfessionDataView.component';

const routes: Routes = [
	{
		path: '',
		component: MainProfessionListViewComponent,
	},
	{
		path: 'andmed',
		component: MainProfessionDataViewComponent,
	},
];

@NgModule({
	declarations: [
		MainProfessionListViewComponent,
		MainProfessionsSearchResultsComponent,
		MainProfessionDataViewComponent,
	],
	imports: [
		RouterModule.forChild(translateRoutes(routes)),
		AssetsModule,
		TranslateModule,
		CommonModule,
		FormsModule,
		AppPipes,
	],
	exports: [MainProfessionListViewComponent],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: DedrupalizeInterceptor,
			multi: true,
		},
	],
})
export class MainProfessionListViewModule {}
