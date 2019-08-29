import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import labeledSeparatorMd from './labeledSeparator.md';
import {
  withKnobs,
  text,
  optionsKnob as options,
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
  const vertical = options(
    'Vertical',
    {
      Yes: 'yes',
      No: 'no',
    },
    'no',
    {
      display: 'inline-radio',
    },
  );
  // tslint:disable-next-line: max-line-length
  const content = text('Vertical content', 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.');
  return {
    moduleMetadata,
    props: {
      content,
      label,
      vertical,
    },
    template: `
      <div style="display: flex;">
        <p *ngIf="vertical === 'yes'">{{content}}</p>
        <labeled-separator
          [label]="label"
          [vertical]="vertical === 'yes'">
        </labeled-separator>
        <p *ngIf="vertical === 'yes'">{{content}}</p>
      </div>
    `,
  };
},          {
  notes: { markdown: labeledSeparatorMd },
});
