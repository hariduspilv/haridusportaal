import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import shareMd from './share.md';
import shareHtml from './share.html';
import { TranslateModule } from '@app/_modules/translate';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

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

const stories = storiesOf('Assets', module);

stories.add('Share', () => {

  return {
    moduleMetadata,
    props: {

    },
    template: shareHtml,
  };
},          {
  notes: { markdown: shareMd },
});
