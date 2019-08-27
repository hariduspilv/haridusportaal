import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import favouriteMd from './favourite.md';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import {
  withKnobs,
  optionsKnob as options,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Favourite', () => {
  // tslint:disable-next-line: max-line-length
  // const jwtToken = text('Authorization', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NjY4Mjk3MTIsImV4cCI6MTU2NjgzMzMxMiwiZHJ1cGFsIjp7InVpZCI6IjE1NzAifSwicm9sZSI6eyJjdXJyZW50X3JvbGUiOnsidHlwZSI6Im5hdHVyYWxfcGVyc29uIn19LCJ1c2VybmFtZSI6IjM5MzA0MDk1MjE3IiwiZmlyc3RuYW1lIjpudWxsLCJsYXN0bmFtZSI6bnVsbH0.voPL3S8sXJo81c0ZQuabNWHaw2woLQC7FxMy-dZj-Eq-TmYp2qZGekibqfAMaXLQYiZ1u68xeNDaBYrJwpv7Gw');
  const entity = {
    isFavorite: true,
    nid: 48788,
    title: 'Artikkel mugudest',
    // tslint:disable-next-line: max-line-length
    fieldBodySummary: 'Eile ja täna kogunevad Tallinnas OECD liikmesriikide eksperbfdfdsbsfdbdid, kes arutavad, kuidas mõõta teaduse ja tehnoloogia mõju ühiskonnale ja majandusele. Riikide kogemuste kõrvutamine näitab.',
    fieldVideo: [
      {
        input: 'https://www.youtube.com/watch?v=atY7ymXAcRQ',
        videoDomain: 'youtube.com',
        videoDescription: 'Sunshine lollipops and rainbows!',
        videoId: 'atY7ymXAcRQ',
      },
    ],
  };
  const limit = options(
    'Favourites limit reached',
    {
      Yes: 'yes',
      No: 'no',
    },
    'no',
    {
      display: 'inline-radio',
    },
  );
  return {
    moduleMetadata,
    props: {
      limit,
      entity,
      // jwtToken,
    },
    template: `
      <block>
        <block-content>
          <h1 style="margin-bottom: 1rem;">{{entity.title}}</h1>
          <favourite [id]="entity.nid"
            [state]="entity.isFavorite"
            [title]="entity.title"
            [limit]="limit === 'yes'">
          </favourite>
          <div style="font-weight: 500;margin: 1rem 0;">{{ entity.fieldBodySummary }}</div>
          <htm-video [videos]="entity.fieldVideo"></htm-video>
        </block-content>
      </block>
      `,
  };
},          {
  notes: { markdown: favouriteMd },
});
