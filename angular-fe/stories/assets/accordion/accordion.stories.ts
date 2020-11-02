import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import documentationMd from './documentation.md';
import instructionsMd from './instructions.md';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@app/_modules/translate';
import defaultAccordionHtml from './defaultAccordion.html';
import collapsibleAccordionHtml from './collapsibleAccordion.html';
import { RippleService } from '@app/_services';
import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
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

const stories = storiesOf('Assets/Accordion', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: defaultAccordionHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Collapsible', () => {

  return {
    moduleMetadata,
    template: collapsibleAccordionHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
