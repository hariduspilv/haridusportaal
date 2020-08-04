import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { EventsViewComponent } from './eventsView.component';
import { EventsListComponent } from '@app/_assets/eventsList';
import { SettingsService } from '@app/_services';
import { FiltersService } from '@app/_services/filterService';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppPipes } from '@app/_pipes';

const routes: Routes = [
  {
    path: '',
    component: EventsViewComponent,
    data: {
      calendar: false,
    },
  },
  {
    path: 'kalender',
    component: EventsViewComponent,
    data: {
      calendar: true,
    },
  },
];

@NgModule({
  declarations: [
    EventsViewComponent,
    EventsListComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppPipes,
  ],
  exports: [
    EventsViewComponent,
    EventsListComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    FiltersService,
    DeviceDetectorService,
  ],
})

export class EventsViewModule { }
