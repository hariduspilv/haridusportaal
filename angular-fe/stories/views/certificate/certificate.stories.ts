import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import certificateStoriesTemplateHtml from './certificate.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { Alert, AlertType } from '@app/_services';
import {
  text,
  withKnobs,
  select,
  object,
} from '@storybook/addon-knobs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const breadcrumbsData = [
  {
    title: 'Avaleht',
    link: '/',
  },
  {
    title: 'Riigieksami tunnistuse kehtivuse kontroll',
  },
];

const stories = storiesOf('Views', module);
stories.addDecorator(withKnobs);
stories.add('Certificate check', () => {
  const certificate = {
    nimi: 'Mari Maasikas',
    tunnistus_nr: '222-0011122-1',
    kehtiv: '1',
    eksam_jada: [
      {
        nimetus: 'Matemaatika',
        aeg: '22.06.2015',
        staatus: '1',
        tulemus: '92p 100-st, 92% ',
      },
      {
        nimetus: 'Vene keel',
        aeg: '22.06.2015',
        staatus: '1',
        tulemus: '92p 100-st, 92% ',
      },
    ],
  };
  const resultSetIds = {
    id_code: null,
    certificate_id: null,
  };
  const errorMessage = text('Error message', 'Valed sisendandmed');
  const certificateData = object('Certificate data', certificate);
  const result = select(
    'Request result',
    {
      success: 'true',
      error: 'false',
    },
    'true',
  );
  const alerts = [];
  const fieldSum = function () {
    let counter = 0;
    if (this.certificateData && this.certificateData.nimi) { counter += 1; }
    if (this.certificateData && this.certificateData.tunnistus_nr) { counter += 1; }
    if (this.certificateData && this.certificateData.kehtiv) { counter += 1; }
    return counter;
  };
  const mock = function () {
    this.dataFetched = false;
    this.loading = true;
    switch (this.result) {
      case true:
        setTimeout(() => {
          this.dataFetched = true;
          this.loading = false;
        },         250);
        break;
      case false:
        this.alerts = [];
        setTimeout(() => {
          this.alerts.push(new Alert(
            {
              message: errorMessage,
              id: 'error',
              type: AlertType.Error,
            },
          ));
          this.loading = false;
        },         250);
        break;
    }
  };
  const model = {
    captcha: false,
    id_code: '',
    certificate_id: '',
  };
  return {
    moduleMetadata,
    props: {
      resultSetIds,
      certificateData,
      mock,
      fieldSum,
      result,
      alerts,
      errorMessage,
      model,
      breadcrumbsData,
    },
    template: certificateStoriesTemplateHtml,
    styleUrls: ['./certificate.stories.styles.scss'],
  };
});
