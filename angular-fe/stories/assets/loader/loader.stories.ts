import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Assets/Loader', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: `
      <loader></loader>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
