import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import filtersMd from './filters.md';
import filtersTemplateHtml from './filters.template.html';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import { SettingsService } from '@app/_services/SettingsService';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    SettingsService,
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Filters', () => {

  const options = [
    { key: 'Select an option', value: '' },
    { key: 'Value numero unos', value: '1' },
    { key: 'Value numero duos', value: '2' },
    { key: 'Value numero tres', value: '3' },
  ];

  const filters = {
    search: '',
    date: '',
    selectField: '',
  };
  return {
    moduleMetadata,
    props: {
      options,
      filters,
    },
    template: filtersTemplateHtml,
  };
},          {
  notes: { markdown: filtersMd },
});
