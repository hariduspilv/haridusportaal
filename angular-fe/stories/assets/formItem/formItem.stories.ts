import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import formItemMd from './formItem.md';
import { TranslateModule } from '@app/_modules/translate';
import { LOCALE_ID } from '@angular/core';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
import { formItems } from './formItem.data';
import templateHtml from './template.html';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';

localeEt[5][1] = localeEt[5][2].map((item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
});

import { DeviceDetectorService } from 'ngx-device-detector';

registerLocaleData(localeEt);

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue:'et' },
  ],
};

const stories = storiesOf('Assets', module);

stories.addDecorator(withKnobs);
stories.add('Form item', () => {
  const status = select(
    'Status',
    {
      Default: 'default',
      Error: 'error',
      Success: 'success',
    },
    'default',
  );
  const error = true;
  return {
    moduleMetadata,
    props: {
      formItems,
      error,
      status,
    },
    template: templateHtml,
  };
},          {
  notes: { markdown: formItemMd },
});
