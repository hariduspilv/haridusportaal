import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import programmesCompareStoriesMd from './programmes.compare.stories.md';
import programmesCompareStoriesTemplateHtml from './programmes.compare.stories.template.html';
import { ActivatedRoute } from '@angular/router';
import { CompareViewComponent } from '@app/_views/compareView/compareView.component';
import { AppPipes } from '@app/_pipes';

const moduleMetadata = {
  imports: [
    AssetsModule.forRoot(),
    RouterTestingModule,
    TranslateModule.forRoot(),
    AppPipes,
  ],
  declarations: [
    CompareViewComponent,
  ],
  providers: [
    { provide: ActivatedRoute, useValue: {
      snapshot: {
        data: {},
      },
    } },
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

// const stories = storiesOf('Views/Compare', module);

// stories.add('Studyprogrammes', () => {
//   return {
//     moduleMetadata,
//     props: {
//       breadcrumbsData,
//     },
//     template: programmesCompareStoriesTemplateHtml,
//   };
// },          {
//   notes: { markdown: programmesCompareStoriesMd },
// });
