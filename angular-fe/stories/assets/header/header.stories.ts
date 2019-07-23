import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import headerMd from './header.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.add(
  'Header', () => {
    return {
      moduleMetadata,
      template: `
          <htm-header></htm-header>
        `,
    };
  },
  {
    notes: { markdown: headerMd },
  },
);
