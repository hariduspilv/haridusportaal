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

const images = [
  {
    derivative: {
      // tslint:disable-next-line
      url: 'http://htm.wiseman.ee/sites/default/files/styles/crop_large/public/2019-09/4.jpeg?itok=6nd3dmsR',
    },
    alt: 'Alt text',
    title: 'Title text',
  },
  {
    derivative: {
      // tslint:disable-next-line
      url: 'https://htm.wiseman.ee/sites/default/files/styles/crop_large/public/2019-04/4.9mb_1.jpg?itok=advang_9',
    },
    alt: 'Alt text 2',
    title: 'Title text 2',
  },
];

stories.add('Image', () => {

  return {
    moduleMetadata,
    props: {
      images
    },
    template: imageHtml,
  };
},          {
  notes: { markdown: imageMd },
});
