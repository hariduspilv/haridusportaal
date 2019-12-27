import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService, RippleService, ModalService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import mainProfessionListViewHtml from './mainProfessionListView.html';
import mainProfessionListViewMd from './mainProfessionListView.md';
import { AssetsModule } from '@app/_assets';
import { MainProfessionListViewModule } from '@app/_views/mainProfessionListView';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    MainProfessionListViewModule,
    AssetsModule,
  ],
  providers: [
    TranslateService,
    SettingsService,
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const path = '/ametialad';

const stories = storiesOf('List views', module);

stories.add('Main professions', () => {

  return {
    moduleMetadata,
    props: {
      path,
    },
    template: mainProfessionListViewHtml,
  };
},          {
  notes: { markdown: mainProfessionListViewMd },
});
