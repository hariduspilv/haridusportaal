import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import shareHtml from './share.html';
import { TranslateModule } from '@app/_modules/translate';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [
    RippleService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Share', module);

stories.add('Default', () => {

  return {
    moduleMetadata,
    template: shareHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
