import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService, RippleService, ModalService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import homeSearchListViewHtml from './homeSearchListView.html';
import homeSearchListViewMd from './homeSearchListView.md';
import { AssetsModule } from '@app/_assets';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    AssetsModule,
  ],
  providers: [
    TranslateService,
    SettingsService,
    RippleService,
    ModalService,
  ],
};

const stories = storiesOf('List views', module);

stories.add('Home search', () => {

  return {
    moduleMetadata,
    props: {},
    template: homeSearchListViewHtml,
  };
},          {
  notes: { markdown: homeSearchListViewMd },
});