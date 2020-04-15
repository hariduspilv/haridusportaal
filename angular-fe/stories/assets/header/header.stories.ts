import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import headerMd from './header.md';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  text,
  optionsKnob as options,
} from '@storybook/addon-knobs';
import { ModalService, RippleService, AnalyticsService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { AddressService } from '@app/_services/AddressService';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    ModalService,
    RippleService,
    AnalyticsService,
    QueryParamsService,
    AddressService,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add(
  'Header', () => {
    const user = text('Username', 'Mari Maasikas');
    const logged = options(
      'Logged in',
      {
        Yes: 'yes',
        No: 'no',
      },
      'no',
      {
        display: 'inline-radio',
      },
    );
    return {
      moduleMetadata,
      props: {
        user,
        logged,
      },
      template: `
        <htm-header
          [loginStatus]="logged === 'yes'"
          [user]="user">
        </htm-header>`,
    };
  },
  {
    notes: { markdown: headerMd },
  },
);
