import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import programmesCompareStoriesMd from './programmes.compare.stories.md';
import programmesCompareStoriesTemplateHtml from './programmes.compare.stories.template.html';
import {
  withKnobs,
} from '@storybook/addon-knobs';
import { ModalService, RippleService, SettingsService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    ModalService,
    RippleService,
    SettingsService,
  ]
};
const breadcrumbsData = [
  {
    title: 'Avaleht',
    link: '/',
  },
  {
    title: 'Erialad',
    link: '/erialad',
  },
  {
    title: 'Võrdlus',
  },
];

const stories = storiesOf('Views', module);
stories.addDecorator(withKnobs);
stories.add('Studyprogrammes compare', () => {
  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
    },
    template: programmesCompareStoriesTemplateHtml,
  };
},          {
  notes: { markdown: programmesCompareStoriesMd },
});
