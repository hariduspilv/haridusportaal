import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets/Labeled separator', module);

stories.add('Horizontal', () => {
  return {
    moduleMetadata,
    path: '',
    template: `
      <labeled-separator
        label="Või"
        type="horizontal">
      </labeled-separator>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Vertical', () => {
  return {
    moduleMetadata,
    path: '',
    template: `
      <labeled-separator
        label="Või"
        type="vertical">
      </labeled-separator>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Login', () => {
  return {
    moduleMetadata,
    path: '',
    template: `
      <labeled-separator
        label="Või"
        type="login">
      </labeled-separator>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Horizontal with long label', () => {
  return {
    moduleMetadata,
    path: '',
    template: `
      <labeled-separator
        label="Lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet"
        type="horizontal">
      </labeled-separator>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Vertical with long label', () => {
  return {
    moduleMetadata,
    path: '',
    template: `
      <labeled-separator
        label="Lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet"
        type="vertical">
      </labeled-separator>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
