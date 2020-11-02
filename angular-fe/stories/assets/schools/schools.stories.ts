import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import schoolsHtml from './schools.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './schools.data';
import { ModalService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

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

const stories = storiesOf('Assets/List', module);

stories.add('Schools', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: schoolsHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
