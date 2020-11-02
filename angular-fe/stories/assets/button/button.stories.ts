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

const stories = storiesOf('Assets/Button', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    template: `
      <button htm-button>Default</button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
stories.add('Inverted', () => {
  return {
    moduleMetadata,
    template: `
      <button htm-button theme="inverted">Inverted</button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
stories.add('Plain', () => {
  return {
    moduleMetadata,
    template: `
      <button htm-button theme="plain">Plain</button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
stories.add('Icon', () => {
  return {
    moduleMetadata,
    template: `
      <button htm-button theme="icon">
        <icon glyph="x" size="medium"></icon>
      </button>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
