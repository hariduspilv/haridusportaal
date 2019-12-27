import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import chartDataViewTemplateHtml from './chart.data.view.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { chartData } from './chart.data.view.data';
import {
  text,
  withKnobs,
} from '@storybook/addon-knobs';
import { RippleService, ModalService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    TranslateService,
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
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
stories.add('Chart data view', () => {
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
    template: chartDataViewTemplateHtml,
    styleUrls: ['./chart.data.view.scss'],
  };
});
