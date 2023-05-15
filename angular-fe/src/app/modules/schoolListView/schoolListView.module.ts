import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { SchoolListViewComponent } from './containers/list-view/schoolListView.component';
import { AppPipes } from '@app/_pipes';
import { SchoolListMapComponent } from './containers/map-view/schoolListMap.component';
import { translateRoutes } from '@app/_core/router-utility';
import { DedrupalizeInterceptor } from '@app/_interceptors/dedrupalize.interceptor';

const routes: Routes = [
	{
		path: '',
		component: SchoolListViewComponent,
	},
	{
		path: 'kaart',
		component: SchoolListMapComponent,
	},
];

@NgModule({
	declarations: [SchoolListViewComponent, SchoolListMapComponent],
	imports: [
		RouterModule.forChild(translateRoutes(routes)),
		AssetsModule,
		TranslateModule,
		CommonModule,
		FormsModule,
		AppPipes,
	],
	exports: [SchoolListViewComponent],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: DedrupalizeInterceptor,
			multi: true,
		},
	],
})
export class SchoolListViewModule {}
