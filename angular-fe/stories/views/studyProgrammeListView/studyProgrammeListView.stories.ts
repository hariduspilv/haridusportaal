import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService, RippleService, ModalService, AnalyticsService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import studyProgrammeListViewStoriesHtml from './studyProgrammeListView.stories.html';
import studyProgrammeListViewStoriesMd from './studyProgrammeListView.stories.md';
import { AssetsModule } from '@app/_assets';
import { StudyProgrammeListViewModule } from '@app/_views/studyProgrammeListView';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '@app/_services/AddressService';
import { SettingsModule } from '@app/_modules/settings/settings.module';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    StudyProgrammeListViewModule,
    AssetsModule,
    SettingsModule.forRoot(),
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

stories.add('Study programme', () => {

  return {
    moduleMetadata,
    props: {},
    template: studyProgrammeListViewStoriesHtml,
  };
},          {
  notes: { markdown: studyProgrammeListViewStoriesMd },
});
