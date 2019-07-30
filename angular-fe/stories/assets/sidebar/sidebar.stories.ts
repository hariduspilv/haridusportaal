import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import sidebarMd from './sidebar.md';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './sidebar.data';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Sidebar', () => {
  const keys = Object.keys(data.entity);
  return {
    moduleMetadata,
    props: {
      keys,
      data: data.entity,
    },
    template: `
      <sidebar [data]="data" [keys]="keys"></sidebar>
    `,
  };
},          {
  notes: { markdown: sidebarMd },
});
