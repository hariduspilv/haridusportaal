import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import dashboardMd from './dashboard.md';
import dashboardHtml from './dashboard.html';
import { TranslateModule } from '@app/_modules/translate';
import { breadcrumbsData } from './dashboard.data';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@app/_services';
import { HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
  providers: [
    UserService,
  ],
};

const stories = storiesOf('Views', module);

stories.add('Dashboard', () => {

  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
    },
    template: dashboardHtml,
  };
},          {
  notes: { markdown: dashboardMd },
});
