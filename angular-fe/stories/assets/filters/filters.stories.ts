import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import filtersMd from './filters.md';
import filtersTemplateHtml from './filters.template.html';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import { TitleService } from "@app/_services/TitleService";

const moduleMetadata = {
  imports: [
    AssetsModule.forRoot(),
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
	providers: [
		TitleService,
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
