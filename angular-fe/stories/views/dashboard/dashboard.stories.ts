import { storiesOf, forceReRender } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import dashboardMd from './dashboard.md';
import dashboardHtml from './dashboard.html';
import { TranslateModule } from '@app/_modules/translate';
import { breadcrumbsData } from './dashboard.data';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
  withKnobs,
  button,
  text,
 } from '@storybook/addon-knobs';
import { UserService } from '@app/_services/userService';

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

  stories.addDecorator(withKnobs);

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
