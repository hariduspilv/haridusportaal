import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import dropdownListMd from './dropdownList.md';
import dropdownListHtml from './dropdownList.html';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './dropdownList.data';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
    BrowserAnimationsModule,
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Dropdown List', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: dropdownListHtml,
  };
},          {
  notes: { markdown: dropdownListMd },
});
