import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import studyProgrammesHtml from './studyProgrammes.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './studyProgrammes.data';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalService, RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { AddressService } from '@app/_services/AddressService';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    ModalService,
    RippleService,
    AddressService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/List', module);

stories.add('Studyprogrammes', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: studyProgrammesHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
