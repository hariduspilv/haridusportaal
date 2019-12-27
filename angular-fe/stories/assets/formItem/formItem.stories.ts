import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import formItemMd from './formItem.md';
import { TranslateModule } from '@app/_modules/translate';
import { LOCALE_ID, PLATFORM_ID, Inject } from '@angular/core';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
import { formItems } from './formItem.data';
import templateHtml from './template.html';
import {
  withKnobs,
  optionsKnob as options,
  select,
  button,
} from '@storybook/addon-knobs';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

localeEt[5][1] = localeEt[5][2].map((item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
});
registerLocaleData(localeEt);

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    { provide: LOCALE_ID, useValue:'et' },
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const reload = () => {
};

const stories = storiesOf('Assets', module);

stories.addDecorator(withKnobs);
stories.add('Form item', () => {

  const isMobile = window.innerWidth < 600 ? true : false;

  const status = select(
    'Status',
    {
      Default: 'default',
      Error: 'error',
      Success: 'success',
    },
    'default',
  );

  const refresh = button('Update', reload);

  const error = true;

  return {
    moduleMetadata,
    props: {
      formItems,
      error,
      status,
      isMobile,
    },
    template: templateHtml,
  };
},          {
  notes: { markdown: formItemMd },
});
