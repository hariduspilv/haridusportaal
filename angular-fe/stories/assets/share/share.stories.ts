import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import shareMd from './share.md';
import shareHtml from './share.html';
import { TranslateModule } from '@app/_modules/translate';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
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
