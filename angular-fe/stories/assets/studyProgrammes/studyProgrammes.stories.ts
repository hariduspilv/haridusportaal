import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import listItemMd from './list-item.md';
import listItemHtml from './list-item.html';
import { TranslateModule } from '@app/_modules/translate';
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

const objectKeys = Object.keys;

stories.addDecorator(withKnobs);

stories.add('List item', () => {

  return {
    moduleMetadata,
    props: {
      objectKeys,
      list,
    },
    template: listItemHtml,
  };
},          {
  notes: { markdown: listItemMd },
});
