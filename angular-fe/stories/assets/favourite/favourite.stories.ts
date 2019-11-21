import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import favouriteMd from './favourite.md';
import { TranslateModule } from '@app/_modules/translate';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  withKnobs,
  optionsKnob as options,
} from '@storybook/addon-knobs';
import { RippleService, ModalService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
    BrowserAnimationsModule,
  ],
  providers: [
    RippleService,
    ModalService,
  ]
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Favourite', () => {
  const entity = {
    title: 'Artikkel mugudest',
    isFavorite: true,
    nid: 48788,
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
    },
    template: `
      <favourite
        [id]="entity.nid"
        [state]="entity.isFavorite"
        [limit]="limit === 'yes'">
      </favourite>
      `,
  };
},          {
  notes: { markdown: favouriteMd },
});
