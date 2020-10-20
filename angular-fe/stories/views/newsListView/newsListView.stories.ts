import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService, RippleService, ModalService, AnalyticsService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import newsListViewHtml from './newsListView.html';
import newsListViewMd from './newsListView.md';
import { AssetsModule } from '@app/_assets';
import { NewsListViewModule } from '@app/_views/newsListView';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '@app/_services/AddressService';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    NewsListViewModule,
    AssetsModule,
  ],
  providers: [
    AnalyticsService,
    AddressService,
    TranslateService,
    SettingsService,
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('List views', module);

stories.add('News', () => {

  return {
    moduleMetadata,
    template: newsListViewHtml,
  };
},          {
  notes: { markdown: newsListViewMd },
});
