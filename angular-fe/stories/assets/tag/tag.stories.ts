import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { RippleService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    RippleService,
  ],
};

const stories = storiesOf('Assets/Tag', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: `
      <button tag>Default</button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
stories.add('Selected', () => {
  return {
    moduleMetadata,
    template: `
      <button tag active="true">Active</button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
