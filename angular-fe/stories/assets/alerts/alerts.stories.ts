import { storiesOf, forceReRender } from '@storybook/angular';
import Events from '@storybook/core-events'
import {
  withKnobs,
  optionsKnob as options,
  boolean,
  button,
  text
} from '@storybook/addon-knobs';

import { AssetsModule } from '@app/_assets';
import alertsMd from './alerts.md';
import { Alert, AlertType } from '@app/_services/AlertsService';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
  ]
};

let alerts = [
  new Alert({message: 'Error tekst', type: AlertType.Error}),
]
const addAlert = (message, type, closeable) => {
  console.log(message, type, closeable);
  alerts.push(new Alert({
    message,
    id: 'global',
    closeable,
    type
  }));
}

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Alerts', () => {
  const size = options('Size', {Big:'big', Small:'small'}, 'big', { display: 'inline-radio'});
  const message = text('Text', 'ERR420');
  const type = options('Type', {Error: AlertType.Error, Warning: AlertType.Warning, Info: AlertType.Info, Success: AlertType.Success}, AlertType.Error, { display: 'select' });
  const closeable = boolean('Closeable?', false);
  button('Add alert', () => addAlert(message, type, closeable ))
  button('Clear alerts', () => alerts=[]);
  return {
    moduleMetadata,
    props: {
      size,
      type,
      closeable,
      alerts,
      message,
      addAlert
    },
    template: `
      <button htm-button theme="default" (click)="addAlert(message, type, closeable)">Add alert</button>
      <alerts [alerts]="alerts" id="global" [small]="sizeOptions === 'small'"></alerts>
    `,
  };
},          {
  notes: { markdown: alertsMd },
});