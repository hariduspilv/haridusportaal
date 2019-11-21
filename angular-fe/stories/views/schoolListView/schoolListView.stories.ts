import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService, RippleService, ModalService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import schoolListViewHtml from './schoolListView.html';
import schoolListViewMd from './schoolListView.md';
import { AssetsModule } from '@app/_assets';
import { SchoolListViewModule } from '@app/_views/schoolListView';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    SchoolListViewModule,
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

stories.add('School', () => {

  return {
    moduleMetadata,
    props: {},
    template: schoolListViewHtml,
  };
},          {
  notes: { markdown: schoolListViewMd },
});