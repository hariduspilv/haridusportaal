import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RippleService, ModalService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
    BrowserAnimationsModule,
  ],
  providers: [
    RippleService,
    ModalService,
  ],
};

const stories = storiesOf('Assets/Favourites', module);

stories.add('Selected', () => {
  return {
    moduleMetadata,
    template: `
      <favourite
        [state]="true">
      </favourite>
      `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Not selected', () => {
  return {
    moduleMetadata,
    template: `
      <favourite
        [state]="false">
      </favourite>
      `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
