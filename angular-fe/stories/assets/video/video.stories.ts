import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Video', module);

stories.add('Default', () => {

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
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
