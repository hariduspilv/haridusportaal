import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateService } from '@app/_modules/translate/translate.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Assets/Labels', module);

const fieldTags = [
  {
    entity: {
      entityLabel: 'kala',
      tid: 2445,
    },
  },
  {
    entity: {
      entityLabel: 'kaos',
      tid: 2441,
    },
  },
  {
    entity: {
      entityLabel: 'õpetajate päev',
      tid: 2582,
    },
  },
];

stories.add('Default', () => {
  return {
    moduleMetadata,
    props: { fieldTags },
    template: `
      <labels [data]="fieldTags"></labels>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
stories.add('Plain', () => {
  return {
    moduleMetadata,
    props: { fieldTags },
    template: `
      <labels [data]="fieldTags" type="plain"></labels>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Aqua', () => {
  return {
    moduleMetadata,
    props: { fieldTags },
    template: `
      <labels [data]="fieldTags" type="aqua"></labels>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Orange', () => {
  return {
    moduleMetadata,
    props: { fieldTags },
    template: `
      <labels [data]="fieldTags" type="orange"></labels>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
