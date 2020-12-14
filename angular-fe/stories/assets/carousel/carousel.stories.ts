import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './carousel.data';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [],
};

const stories = storiesOf('Assets/Carousel', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: `
      <carousel [data]="data"></carousel>
    `,
    props: {
      data,
    },
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
