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
    { provide: LOCALE_ID, useValue:'et' },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Form item', () => {
  return {
    moduleMetadata,
    props: {
      formItems,
    },
    template: templateHtml,
  };
},          {
  notes: { markdown: formItemMd },
});
