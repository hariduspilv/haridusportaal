import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import autocompleteMd from './autocomplete.md';
import autocompleteHtml from './autocomplete.html';
import { TranslateService } from '@app/_modules/translate/translate.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Autocomplete', () => {

  return {
    moduleMetadata,
    props: {

    },
    template: autocompleteHtml,
  };
},          {
  notes: { markdown: autocompleteMd },
});
