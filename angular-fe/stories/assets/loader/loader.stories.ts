import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import loaderMd from './loader.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Loader', () => {
  return {
    moduleMetadata,
    template: `
      <loader></loader>
    `,
  };
},          {
  notes: { markdown: loaderMd },
});
