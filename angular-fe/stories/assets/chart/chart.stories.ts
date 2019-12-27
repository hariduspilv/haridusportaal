import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import chartMd from './chart.md';
import { data } from './chart.data';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    TranslateModule.forRoot(),
    AssetsModule,
  ],
  providers: [
    RippleService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.fieldWideDynamicGraph" [wide]="true" type="filter"></chart>
      <chart [data]="data.fieldDynamicGraph" type="filter"></chart>
    `,
  };
},          {
  notes: { markdown: chartMd },
});
