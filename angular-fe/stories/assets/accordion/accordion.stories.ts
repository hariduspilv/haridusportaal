import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import accordionMd from './accordion.md';
import {
  withKnobs,
  optionsKnob as options,
} from '@storybook/addon-knobs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@app/_modules/translate';
import accordionHtml from './accordion.html';

const moduleMetadata = {
  imports: [
    AssetsModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Accordion', () => {

  const collapsible = options(
    'Collapsible',
    {
      True: '1',
      False: '0',
    },
    '0',
    {
      display: 'inline-radio',
    });

  return {
    moduleMetadata,
    props: {
      collapsible,
    },
    template: accordionHtml,
  };
},          {
  notes: { markdown: accordionMd },
});
