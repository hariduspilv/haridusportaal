import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { translateRoutes } from '@app/_core/router-utility';
import {
	YouthMonitoringListComponent
} from '@app/modules/youth-monitoring/containers/youth-monitoring-list/youth-monitoring-list.component';
import {
	YouthMonitoringDetailComponent
} from '@app/modules/youth-monitoring/containers/youth-monitoring-detail/youth-monitoring-detail.component';

const routes: Routes = [
	{
		path: '',
		component: YouthMonitoringListComponent,
	},
	{
		path: ':id',
		component: YouthMonitoringDetailComponent,
	}
];

@NgModule({
	declarations: [
		YouthMonitoringListComponent,
		YouthMonitoringDetailComponent,
	],
	imports: [
		RouterModule.forChild((translateRoutes(routes))),
	],
	exports: [],
	providers: [],
})
export class YouthMonitoringModule {}
