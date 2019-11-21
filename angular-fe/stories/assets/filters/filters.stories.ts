import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import filtersMd from './filters.md';
import filtersTemplateHtml from './filters.template.html';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import { SettingsService } from '@app/_services/SettingsService';
import { RippleService, ModalService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    SettingsService,
    RippleService,
    ModalService,
  ],
};

const opts = [
  { key: 'Select an option', value: '' },
  { key: 'Value numero unos', value: '1' },
  { key: 'Value numero duos', value: '2' },
  { key: 'Value numero tres', value: '3' },
];

const breadcrumbs = [
  {
    title: 'Avaleht',
    link: '/',
  },
  {
    title: 'Uudised',
  },
];

const typeOptions = [
  {
    key: 'asdasd',
    value: '1308',
  },
  {
    key: 'aaaa',
    value: '1287',
  },
];

const notes = { markdown: filtersMd };

const storyData = (type) => {
  return {
    moduleMetadata,
    props: {
      breadcrumbs,
      type,
      typeOptions,
      options: opts,
    },
    template: filtersTemplateHtml,
  };
};

const stories = storiesOf('Filters', module);

stories.add('News', () => { return storyData('news'); }, { notes });
stories.add('School', () => { return storyData('school'); }, { notes });
stories.add('studyProgramme', () => { return storyData('studyProgramme'); }, { notes });
