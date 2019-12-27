import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import schoolsMd from './schools.md';
import schoolsHtml from './schools.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './schools.data';
import { ModalService } from '@app/_services';
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
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Schools', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: schoolsHtml,
  };
},          {
  notes: { markdown: schoolsMd },
});
