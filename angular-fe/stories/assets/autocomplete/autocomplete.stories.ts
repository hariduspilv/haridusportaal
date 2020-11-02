import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import documentationMd from './documentation.md';
import instructionsMd from './instructions.md';
import defaultAutocompleteHtml from './defaultAutocomplete.html';
import inAdsAutocompleteHtml from './inAdsAutocomplete.html';
import { RippleService, ModalService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { AddressService } from '@app/_services/AddressService';
import { HttpClient } from '@angular/common/http';
import { SettingsModule } from '@app/_modules/settings/settings.module';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    SettingsModule.forRoot(),
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    RippleService,
    ModalService,
    HttpClient,
    AddressService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Autocomplete', module);

stories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      general: '',
    },
    template: defaultAutocompleteHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('InAds address search', () => {
  return {
    moduleMetadata,
    props: {
      inads: '',
    },
    template: inAdsAutocompleteHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
