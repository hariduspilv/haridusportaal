import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import tooltipMd from './tooltip.md';
import tooltipHtml from './tooltip.html';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService, ModalService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    ModalService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Tooltip', () => {

  return {
    moduleMetadata,
    props: {

    },
    template: tooltipHtml,
  };
},          {
  notes: { markdown: tooltipMd },
});
