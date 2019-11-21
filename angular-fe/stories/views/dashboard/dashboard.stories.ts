import { storiesOf, forceReRender } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import dashboardMd from './dashboard.md';
import dashboardHtml from './dashboard.html';
import { TranslateModule } from '@app/_modules/translate';
import { breadcrumbsData } from './dashboard.data';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/_services';
import { DashboardComponent } from '@app/_views/dashboardView/dashboard.component';
import { DashboardViewModule } from '@app/_views/dashboardView';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const moduleMetaData = {
  imports: [
    DashboardViewModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};

const stories = storiesOf('Views', module);

stories.add(
  'Dashboard',
  () => {
    return {
      moduleMetaData,
      props: {},
      template: dashboardHtml,
    };
  },
  {
    notes: { markdown: dashboardMd },
  }
);
