import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import newsMd from './news.md';
import newsHtml from './news.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './news.data';
import { RippleService, ModalService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('News', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: newsHtml,
  };
},          {
  notes: { markdown: newsMd },
});
