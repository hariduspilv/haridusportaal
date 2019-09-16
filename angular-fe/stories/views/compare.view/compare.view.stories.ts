import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import compareViewMd from './compare.view.md';
import compareViewTemplateHtml from './compare.view.template.html';
import {
  withKnobs,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    TranslateService,
  ],
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
stories.add('Compare view', () => {
  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
    },
    template: compareViewTemplateHtml,
  };
},          {
  notes: { markdown: compareViewMd },
  styleUrls: ['./compare.view.scss'],
});
