import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Assets/Label count', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: `
      <label-count count="127">{{ 'search.results_of' | translate }}: </label-count>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
