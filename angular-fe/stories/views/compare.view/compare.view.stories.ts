import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import compareViewStoriesTemplateHtml from './compare.view.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { chartData } from './compare.view.data';
import {
  text,
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
    title: 'Valdkonnad',
    link: '/valdkonnad',
  },
  {
    title: 'Andmed',
  },
];

const stories = storiesOf('Views', module);
stories.addDecorator(withKnobs);
stories.add('Compare view', () => {
  const titleField = text('Title', 'Kalandus või metsandus? See on Püha Graal');
  // tslint:disable-next-line: max-line-length
  const introductionField = text('Introduction', 'Sissejuhatuse tekst, mis kirjeldab, mis võrdlus kamm käib. Sissejuhatuse tekst, mis kirjeldab, mis võrdlus kamm käib.  Sissejuhatuse tekst, mis kirjeldab, mis võrdlus kamm käib.  Sissejuhatuse tekst, mis kirjeldab, mis võrdlus kamm käib.  Sissejuhatuse tekst, mis kirjeldab, mis võrdlus kamm käib.');
  const viewData = {
    entities: [
      {
        title: titleField,
        fieldIntroduction: introductionField,
        oskaGraphData: null,
        fieldDynamicGraph: chartData,
      },
    ],
  };
  return {
    moduleMetadata,
    props: {
      viewData,
      breadcrumbsData,
    },
    template: compareViewStoriesTemplateHtml,
    styleUrls: ['./compare.view.stories.styles.scss'],
  };
});
