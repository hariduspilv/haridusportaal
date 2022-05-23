import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';
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
		{ provide: 'googleTagManagerId', useValue: 'GTM-WK8H92C' },
  ],
};

const stories = storiesOf('Assets/Header', module);

stories.add(
  'Default', () => {
    return {
      moduleMetadata,
      template: `
        <div style="min-height: 500px">
          <htm-header
            [loginStatus]="false"
            user="Mari Maasikas">
          </htm-header>
        </div>`,
    };
  },
  {
    notes: { Instructions: instructionsMd, Documentation: documentationMd },
  },
);
