import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import buttonMd from './button.md';
import { RippleService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    RippleService,
  ]
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Button', () => {

  const theme = select(
    'Theme',
    {
      Default: 'default',
      Inverted: 'inverted',
      Plain: 'plain',
      Icon: 'icon',
    },
    'default',
  );

  return {
    moduleMetadata,
    props: {
      theme,
    },
    template: `
    <button htm-button *ngIf="theme !== 'icon'" [theme]="theme">Nupp</button>
    <button htm-button *ngIf="theme == 'icon'" [theme]="theme">
      <icon glyph="x" size="medium"></icon>
    </button>
    `,
  };
},          {
  notes: { markdown: buttonMd },
});
