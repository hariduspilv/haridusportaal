import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { data } from './menu.data';
import { SidemenuService, RippleService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';
import { SettingsModule } from '@app/_modules/settings/settings.module';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
    SettingsModule.forRoot(),
  ],
  providers: [
    RippleService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Sidemenu', module);
stories.add(
  'Default',
  () => {
    return {
      moduleMetadata,
      props: {
        SidemenuService,
      },
      template: `
        <div class="app-wrapper">
          <sidemenu style="transform: none !important"></sidemenu>
        </div>
      `,
    };
  },
  {
    notes: { Instructions: instructionsMd, Documentation: documentationMd },
  },
);
