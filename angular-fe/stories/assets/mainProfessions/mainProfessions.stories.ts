import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import mainProfessionsMd from './mainProfessions.md';
import mainProfessionsHtml from './mainProfessions.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './mainProfessions.data';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Main Professions', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: mainProfessionsHtml,
  };
},          {
  notes: { markdown: mainProfessionsMd },
});
