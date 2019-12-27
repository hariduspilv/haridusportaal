import { storiesOf, forceReRender } from '@storybook/angular';
import {
  withKnobs,
  optionsKnob as options,
  boolean,
  button,
  text,
} from '@storybook/addon-knobs';
import { manager } from '@storybook/addon-knobs/dist/registerKnobs.js';
import { AssetsModule } from '@app/_assets';
import alertsMd from './alerts.md';
import { Alert, AlertType } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@app/_modules/translate';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { QueryParamsService } from '@app/_services/QueryParams.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    TranslateModule,
  ],
  providers: [
    TranslateService,
    QueryParamsService,
  ],
};

const alerts = [
  new Alert({ message: 'Error tekst', id:'1', type: AlertType.Error }),
  new Alert({ message: `Lorem ipsum dolor sit amet consectetur
    adipisicing elit. Suscipit quis temporibus quos doloribus nulla,
    ducimus perferendis esse nobis laudantium quisquam nemo ipsum at a
    repudiandae obcaecati atque! Debitis, dignissimos voluptatibus.`,
    id:'2', type: AlertType.Warning }),
  new Alert({ message: 'Error tekst', id:'3', type: AlertType.Info }),
  new Alert({ message: 'Error tekst', id:'4',
    type: AlertType.Success, link: { url: '/', label: 'Vaata siin on link link LINK' },
  }),
];

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Alerts', () => {

  return {
    moduleMetadata,
    props: {
      // size,
      // type,
      // closeable,
      alerts,
      // message,
      // add
    },
    template: `
      <h2>Big</h2>
      <alerts [alerts]="alerts" id="big"></alerts>
      <h2>Small</h2>
      <alerts [alerts]="alerts" id="small" small="true"></alerts>
    `,
  };
},          {
  notes: { markdown: alertsMd },
});
