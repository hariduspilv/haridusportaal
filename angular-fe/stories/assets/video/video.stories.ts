import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import videoMd from './video.md';
import { TranslateModule } from '@app/_modules/translate';
import { EmbedVideoService } from 'ngx-embed-video';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    EmbedVideoService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
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
