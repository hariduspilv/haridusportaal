import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AddressService } from '@app/_services/AddressService';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    RippleService,
    AddressService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Feedback', module);

stories.add('Default', () => {

  return {
    moduleMetadata,
    props: {
      nid: 48788,
    },
    template: `
      <feedback [nid]="nid"></feedback>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
