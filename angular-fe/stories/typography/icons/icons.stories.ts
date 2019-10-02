import { storiesOf } from '@storybook/angular';
import { icons } from './icons';
import iconsMd from './icons.md';
import iconsHtml from './icons.html';
import { AssetsModule } from '@app/_assets';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { TranslateModule } from '@app/_modules/translate';
import { TranslateService } from '@app/_modules/translate/translate.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Typography', module);
stories.addDecorator(withKnobs);
stories.add('Icons', () => {

  let tmpIcons = [...icons];

  const background = options(
    'Background',
    {
      Yes: 'yes',
      No: 'no',
    },
    'no',
    {
      display: 'inline-radio',
    },
  );
  const searchField = '';

  const searchIcon = () => {
    tmpIcons = [...icons].filter((item) => {
      return item._name.match(searchField) ? item : false;
    });
    console.log(searchField);
  };

  return {
    moduleMetadata,
    props: {
      background,
      searchField,
      searchIcon,
      icons: tmpIcons,
    },
    template: iconsHtml,
  };
},          {
  notes: { markdown: iconsMd },
});
