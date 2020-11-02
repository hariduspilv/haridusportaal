import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets/Links', module);

const links = [
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link',
  },
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link 2',
  },
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link 3',
  },
];

const attachments = [
  {
    description: 'Kirjeldus',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
  {
    description: 'Kirjeldus 2',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
  {
    description: 'Kirjeldus 3',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
];

stories.add('Default', () => {

  return {
    moduleMetadata,
    props: {
      links,
    },
    template: `
    <links [data]="links"></links>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Documents', () => {

  return {
    moduleMetadata,
    props: {
      attachments,
    },
    template: `
    <links [data]="attachments" type="document"></links>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
