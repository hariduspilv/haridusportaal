import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import dashboardMd from './dashboard.md';
import dashboardHtml from './dashboard.html';
import { TranslateModule } from '@app/_modules/translate';
import { applicationsData, data, breadcrumbsData } from './dashboard.data';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
};

const stories = storiesOf('Views', module);

stories.add('Dashboard', () => {

  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
      data,
      applicationsData,
    },
    template: dashboardHtml,
  };
},          {
  notes: { markdown: dashboardMd },
});
