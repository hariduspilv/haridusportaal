import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import professionsCompareStoriesMd from './professions.compare.stories.md';
import professionsCompareStoriesTemplateHtml from './professions.compare.stories.template.html';
import {
  withKnobs,
} from '@storybook/addon-knobs';
import { RippleService, ModalService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    ModalService
  ]
};
const breadcrumbsData = [
  {
    title: 'Avaleht',
    link: '/',
  },
  {
    title: 'Ametialad',
    link: '/ametialad',
  },
  {
    title: 'Ametialad võrdlus',
  },
];

const stories = storiesOf('Views', module);
stories.addDecorator(withKnobs);
stories.add('Professions compare', () => {
  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
    },
    template: professionsCompareStoriesTemplateHtml,
  };
},          {
  notes: { markdown: professionsCompareStoriesMd },
});
