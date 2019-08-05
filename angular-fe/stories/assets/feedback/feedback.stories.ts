import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import feedbackMd from './feedback.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Feedback', () => {

  return {
    moduleMetadata,
    props: {
      nid: 48788,
    },
    template: `
      <feedback [nid]="nid"></feedback>
    `,
  };
},          {
  notes: { markdown: feedbackMd },
});
