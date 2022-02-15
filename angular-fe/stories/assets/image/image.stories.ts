import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import imageHtml from './image.html';
import imageMd from './image.md';
import { TranslateModule } from '@app/_modules/translate';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { ModalService } from "@app/_services";

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
	providers: [
		ModalService,
	],
};

const stories = storiesOf('Assets/Images', module);

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

stories.add('Default', () => {

  return {
    moduleMetadata,
    props: {
      images,
    },
    template: imageHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
