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
import { RippleService } from '@app/_services';
import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

const moduleMetadata = {
  imports: [
    AssetsModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    RippleService,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: APP_BASE_HREF, useValue: '/' },
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
