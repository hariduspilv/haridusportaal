import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import shareMd from './share.md';
import shareHtml from './share.html';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Share', () => {

  return {
    moduleMetadata,
    props: {

    },
    template: shareHtml,
  };
},          {
  notes: { markdown: shareMd },
});
