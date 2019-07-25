import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import menuMd from './menu.md';
import { data } from './menu.data';
import { SidemenuService } from '@app/_services';

const moduleMetadata = {
  imports: [AssetsModule],
};

const stories = storiesOf('Assets', module);
const sidemenuService:SidemenuService = new SidemenuService();
stories.add(
  'Sidemenu',
  () => {
    return {
      moduleMetadata,
      props: {
        data,
        sidemenuService,
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
