import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { RouterTestingModule } from '@angular/router/testing';
import sidebarMd from './sidebar.md';
import { TranslateModule } from '@app/_modules/translate';
import { data, facts } from './sidebar.data';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Sidebar', () => {
  return {
    moduleMetadata,
    props: {
      facts: facts.entities,
      data: data.entity,
    },
    template: `
      <sidebar [data]="data" [facts]="facts"></sidebar>
    `,
  };
},          {
  notes: { markdown: sidebarMd },
});
