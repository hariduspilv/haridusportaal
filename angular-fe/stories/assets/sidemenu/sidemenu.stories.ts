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
        <div style="height: 100vh; overflow-y: scroll">
        <sidemenu [data]="data"></sidemenu>
        </div>
      `,
    };
  },
  {
    notes: { markdown: menuMd },
  },
);
