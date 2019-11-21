import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import tooltipMd from './tooltip.md';
import tooltipHtml from './tooltip.html';
import { TranslateModule } from '@app/_modules/translate';
import { RippleService, ModalService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    ModalService,
  ]
};

const stories = storiesOf('Assets', module);

stories.add('Tooltip', () => {

  return {
    moduleMetadata,
    props: {

    },
    template: tooltipHtml,
  };
},          {
  notes: { markdown: tooltipMd },
});
