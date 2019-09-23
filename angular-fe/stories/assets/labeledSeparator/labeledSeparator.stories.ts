import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import labeledSeparatorMd from './labeledSeparator.md';
import {
  withKnobs,
  text,
  select,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Labeled separator', () => {
  const label = text('Label', 'Või');
  const type = select(
    'Type',
    {
      Horizontal: 'horizontal',
      Vertical: 'vertical',
      Login: 'login',
    },
    'horizontal',
  );
  return {
    moduleMetadata,
    path: '',
    props: {
      label,
      type,
    },
    template: `
      <labeled-separator
        [label]="label"
        [type]="type">
      </labeled-separator>
    `,
  };
},          {
  notes: { markdown: labeledSeparatorMd },
});
