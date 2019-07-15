import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import buttonMd from './button.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
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
    },
    'default',
  );

  return {
    moduleMetadata,
    props: {
      theme,
    },
    template: `
      <button htm-button [theme]="theme">Nupp</button>
    `,
  };
},          {
  notes: { markdown: buttonMd },
});
