import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import blockQuoteHtml from './blockQuote.html';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets/BlockQuote', module);

stories.add('Default', () => {

  return {
    moduleMetadata,
    template: blockQuoteHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
