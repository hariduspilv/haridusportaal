import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import loaderMd from './loader.md';
import { TranslateService } from '@app/_modules/translate/translate.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
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
