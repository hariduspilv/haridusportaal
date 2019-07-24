import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import headerMd from './header.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.add(
  'Header', () => {
    return {
      moduleMetadata,
      template: `
          <htm-header></htm-header>
          <htm-modal id="search" title="Otsing">
            <modal-content>
              Otsi OTSI otsi
            </modal-content>
          </htm-modal>
          <htm-modal id="login" title="Login" [bottomAction]="false">
            <modal-content>
              Loogika
            </modal-content>
          </htm-modal>
        `,
    };
  },
  {
    notes: { markdown: headerMd },
  },
);
