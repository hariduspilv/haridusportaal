import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './dropdownList.data';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RippleService } from '@app/_services';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
    BrowserAnimationsModule,
  ],
  providers: [
    RippleService,
  ],
};

const stories = storiesOf('Assets/Dropdown List', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      data,
    },
    template: '<dropdown-list [data]="data.nodeQuery.entities"></dropdown-list>',
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
