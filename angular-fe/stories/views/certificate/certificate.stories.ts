import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import certificateStoriesTemplateHtml from './certificate.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { RecaptchaModule } from 'ng-recaptcha';
import {
  withKnobs,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
    RecaptchaModule.forRoot(),
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
  const model = {
    captcha: false,
    id_code: '',
    certificate_id: '',
  };
  return {
    moduleMetadata,
    props: {
      model,
      breadcrumbsData,
    },
    template: certificateStoriesTemplateHtml,
    styleUrls: ['./certificate.stories.styles.scss'],
  };
});
