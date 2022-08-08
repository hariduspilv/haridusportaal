import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { data } from './chart.data';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService, SettingsService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '@app/_services/AddressService';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { SettingsModule } from "@app/_modules/settings/settings.module";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_INITIALIZER } from "@angular/core";

export function settingsProviderFactory(provider: SettingsService) {
	return () => provider.load();
}

const moduleMetadata = {
  imports: [
		AssetsModule,
		RouterTestingModule,
		TranslateModule.forRoot(),
		SettingsModule.forRoot(),
  ],
  providers: [
    RippleService,
    AddressService,
    QueryParamsService,
		{
			provide: APP_INITIALIZER,
			useFactory: settingsProviderFactory,
			deps: [SettingsService],
			multi: true,
		},
		{ provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Charts', module);

stories.add('Line chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.line" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Pie chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.pie" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Doughnut chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.doughnut" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Clustered column + line chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.clusteredColumnWithLine" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Clustered bar chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.clusteredBar" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Stacked column + line chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.stackedColumnWithLine" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Stacked column chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.stackedColumn" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Stacked bar chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.stackedBar" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Stacked bar 100 chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.stackedBar100" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Wide chart', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <chart [data]="data.stackedBar100" [wide]="true" type="filter"></chart>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
