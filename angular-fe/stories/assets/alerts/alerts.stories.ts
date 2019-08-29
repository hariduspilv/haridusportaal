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

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
  ],
};

const alerts = [
  new Alert({ message: 'Error tekst', id:'1', type: AlertType.Error }),
  new Alert({ message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quis temporibus quos doloribus nulla, ducimus perferendis esse nobis laudantium quisquam nemo ipsum at a repudiandae obcaecati atque! Debitis, dignissimos voluptatibus.', id:'2', type: AlertType.Warning }),
  new Alert({ message: 'Error tekst', id:'3', type: AlertType.Info }),
  new Alert({ message: 'Error tekst', id:'4',
    type: AlertType.Success, link: { url: '/', label: 'Vaata siin on link link LINK' },
  }),
];
// const addAlert = (message, type, closeable) => {
//   alerts.push(new Alert({
//     message,
//     id: 'global',
//     closeable,
//     type
//   }));
// }

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Alerts', () => {
  // const size = options('Size', {Big:'big', Small:'small'}, 'big', { display: 'inline-radio'});
  // const message = text('Text', 'ERR420');
  // const type = options('Type', {Error: AlertType.Error, Warning: AlertType.Warning, Info: AlertType.Info, Success: AlertType.Success}, AlertType.Error, { display: 'select' });
  // const closeable = boolean('Closeable?', false);
  // const add = button('Add alert', () => addAlert(message, type, closeable))
  // button('Clear alerts', () => alerts=[]);
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
