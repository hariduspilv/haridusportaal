import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import infographMd from './infograph.md';
import { data } from './infograph.data';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    TranslateModule.forRoot(),
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Infograph', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <infograph [data]="data.fieldWideDynamicGraph" [wide]="true" type="filter"></infograph>
      <infograph [data]="data.fieldDynamicGraph" type="filter"></infograph>
    `,
  };
},          {
  notes: { markdown: infographMd },
});
