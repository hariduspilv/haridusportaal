import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import chartMd from './chart.md';
import { data } from './chart.data';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  select,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    TranslateModule.forRoot(),
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Chart', () => {
  const graphType = select(
    'Graph type',
    {
      DynamicGraph: 'fieldDynamicGraph',
      DynamicGraph2: 'fieldDynamicGraph2',
    },
    'fieldDynamicGraph',
  );

  console.log(data);
  return {
    moduleMetadata,
    props: {
      data,
      graphType,
    },
    template: `
      <chart [data]="data[graphType]" [init]="graphType" type="filter"></chart>
    `,
  };
},          {
  notes: { markdown: chartMd },
});
