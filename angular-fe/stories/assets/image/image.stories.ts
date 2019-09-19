import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import imageHtml from './image.html';
import imageMd from './image.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('List item', () => {

  return {
    moduleMetadata,
    props: {},
    template: imageHtml,
  };
},          {
  notes: { markdown: imageMd },
});
