import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { SettingsService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import studyProgrammeListViewHtml from './studyProgrammeListView.html';
import studyProgrammeListViewMd from './studyProgrammeListView.md';
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
  ],
};

const stories = storiesOf('List views', module);

stories.add('Study programme', () => {

  return {
    moduleMetadata,
    props: {},
    template: studyProgrammeListViewHtml,
  };
},          {
  notes: { markdown: studyProgrammeListViewMd },
});