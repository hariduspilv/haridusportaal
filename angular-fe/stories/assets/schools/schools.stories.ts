import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import schoolsMd from './schools.md';
import schoolsHtml from './schools.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './schools.data';
import {
  withKnobs,
  object,
} from '@storybook/addon-knobs';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Schools', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: schoolsHtml,
  };
},          {
  notes: { markdown: schoolsMd },
});
