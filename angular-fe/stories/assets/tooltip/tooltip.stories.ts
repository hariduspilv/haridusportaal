import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import tooltipHtml from './tooltip.html';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService, ModalService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
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

const stories = storiesOf('Assets/Tooltip', module);

stories.add('Default', () => {

  return {
    moduleMetadata,
    template: tooltipHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
