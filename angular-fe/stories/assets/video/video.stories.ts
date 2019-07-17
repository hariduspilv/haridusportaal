import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import videoMd from './video.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Video', () => {

  const videos = [
    {
      input: 'https://www.youtube.com/watch?v=atY7ymXAcRQ',
      videoDomain: 'youtube.com',
      videoDescription: 'Sunshine lollipops and rainbows!',
      videoId: 'atY7ymXAcRQ',
    },
  ];
  return {
    moduleMetadata,
    props: {
      videos,
    },
    template: `
      <htm-video [videos]="videos"></htm-video>
    `,
  };
},          {
  notes: { markdown: videoMd },
});
