import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import skeletonMd from './skeleton.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Skeleton', () => {

  const types = options(
    'Types',
    {
      Article: 'article',
      Line: 'Line',
    },
    'article',
    {
      display: 'inline-radio',
    });

  return {
    moduleMetadata,
    props: {
      types,
    },
    template: `
      <skeleton [type]="types"></skeleton>
    `,
  };
},          {
  notes: { markdown: skeletonMd },
});
