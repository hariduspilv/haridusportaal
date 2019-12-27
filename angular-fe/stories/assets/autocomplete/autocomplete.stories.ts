import { storiesOf } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';
import autocompleteMd from './autocomplete.md';
import autocompleteHtml from './autocomplete.html';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RippleService, ModalService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
  ],
  providers: [
    TranslateService,
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Autocomplete', () => {

  return {
    moduleMetadata,
    props: {
    },
    template: autocompleteHtml,
  };
},          {
  notes: { markdown: autocompleteMd },
});
