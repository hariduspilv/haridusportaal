import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { translateRoutes } from '@app/_core/router-utility';
import { YouthMonitoringListComponent } from '@app/modules/youth-monitoring/containers/youth-monitoring-list/youth-monitoring-list.component';
import { YouthMonitoringDetailComponent } from '@app/modules/youth-monitoring/containers/youth-monitoring-detail/youth-monitoring-detail.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { YouthMonitoringBannerComponent } from './components/youth-monitoring-banner/youth-monitoring-banner.component';
import { YouthMonitoringApiService } from './youth-monitoring-api.service';
import { YouthMonitoringSidebarBlockComponent } from './components/youth-monitoring-sidebar-block/youth-monitoring-sidebar-block.component';
import { YouthMonitoringSidebarComponent } from './containers/youth-monitoring-sidebar/youth-monitoring-sidebar.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouteUndefinedInterceptor } from '@app/_interceptors/detail-route-undefined.interceptor';
import { YouthMonitoringDetailDataComponent } from './components/youth-monitoring-detail-data/youth-monitoring-detail-data.component';
import { DedrupalizeInterceptor } from '@app/_interceptors/dedrupalize.interceptor';

const routes: Routes = [
	{
		path: '',
		component: YouthMonitoringListComponent,
	},
	{
		path: ':id',
		component: YouthMonitoringDetailComponent,
	},
];

@NgModule({
	declarations: [
		YouthMonitoringListComponent,
		YouthMonitoringDetailComponent,
		YouthMonitoringDetailDataComponent,
		YouthMonitoringBannerComponent,
		YouthMonitoringSidebarBlockComponent,
		YouthMonitoringSidebarComponent,
	],
	imports: [
		RouterModule.forChild(translateRoutes(routes)),
		AssetsModule,
		TranslateModule,
		CommonModule,
		FormsModule,
		AppPipes,
	],
	exports: [],
	providers: [
		YouthMonitoringApiService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: RouteUndefinedInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: DedrupalizeInterceptor,
			multi: true,
		},
	],
})
export class YouthMonitoringModule {}
