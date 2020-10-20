import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import documentationMd from './documentation.md';
import instructionsMd from './instructions.md';
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

const error = new Alert({ message: 'Error text', id:'1', type: AlertType.Error });
const warning = new Alert({ message: `Lorem ipsum dolor sit amet consectetur
    adipisicing elit. Suscipit quis temporibus quos doloribus nulla,
    ducimus perferendis esse nobis laudantium quisquam nemo ipsum at a
    repudiandae obcaecati atque! Debitis, dignissimos voluptatibus.`,
  id:'2', type: AlertType.Warning });
const info = new Alert({ message: 'Info text', id:'3', type: AlertType.Info });
const success = new Alert({ message: 'Success text', id:'4', type: AlertType.Success });
const link = new Alert({ message: 'With link', id:'5', type: AlertType.Success,
  link: { url: '/', label: 'Read more' } });
const notClosable = new Alert({ message: 'Not closable', id:'6',
  type: AlertType.Info, closeable: false });

const stories = storiesOf('Assets/Alerts', module);

stories.add('Error', () => {

  return {
    moduleMetadata,
    props: {
      error,
    },
    template: `
      <alerts [alerts]="[error]" id="big"></alerts>
      <alerts [alerts]="[error]" id="small" small="true"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Warning', () => {

  return {
    moduleMetadata,
    props: {
      warning,
    },
    template: `
      <alerts [alerts]="[warning]" id="big"></alerts>
      <alerts [alerts]="[warning]" id="small" small="true"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Info', () => {

  return {
    moduleMetadata,
    props: {
      info,
    },
    template: `
      <alerts [alerts]="[info]" id="big"></alerts>
      <alerts [alerts]="[info]" id="small" small="true"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Success', () => {

  return {
    moduleMetadata,
    props: {
      success,
    },
    template: `
      <alerts [alerts]="[success]" id="big"></alerts>
      <alerts [alerts]="[success]" id="small" small="true"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With link', () => {

  return {
    moduleMetadata,
    props: {
      link,
    },
    template: `
      <alerts [alerts]="[link]" id="link"></alerts>
      <alerts [alerts]="[link]" small="true" id="link"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Not closeable', () => {

  return {
    moduleMetadata,
    props: {
      notClosable,
    },
    template: `
      <alerts [alerts]="[notClosable]" id="link"></alerts>
      <alerts [alerts]="[notClosable]" small="true" id="link"></alerts>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
