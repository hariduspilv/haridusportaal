import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import linksMd from './links.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

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

stories.add('Links', () => {

  return {
    moduleMetadata,
    props: {
      links,
      attachments,
    },
    template: `
    <h2>Default links</h2>
    <links [data]="links"></links>
    
    <h2>Documents</h2>
    <links [data]="attachments" type="document"></links>
    `,
  };
},          {
  notes: { markdown: linksMd },
});
