import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import menuMd from './menu.md';
import { data } from './menu.data';

const moduleMetadata = {
  imports: [AssetsModule],
};

const stories = storiesOf('Assets', module);

stories.add(
  'Sidemenu',
  () => {
    return {
      moduleMetadata,
      props: {
        data,
      },
      template: `
        <sidemenu [data]="data"></sidemenu>
      `,
    };
  },
  {
    notes: { markdown: menuMd },
  },
);
