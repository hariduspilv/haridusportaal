import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { ModalService, RippleService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import documentationMd from './documentation.md';
import instructionsMd from './instructions.md';
import defaultBlockHtml from './defaultBlock.html';
import tabsBlockHtml from './tabsBlock.html';
import middleTabsHtml from './middleTabs.html';
import withoutTitleHtml from './withoutTitle.html';
import orangeBlockHtml from './orangeBlock.html';
import titleBorderlessHtml from './titleBorderless.html';
import transparentBlockWithoutTitleHtml from './transparentBlockWithoutTitle.html';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
  ],
  providers: [
    ModalService,
    RippleService,
  ],
};

const stories = storiesOf('Assets/Block', module);

stories.add('Default theme', () => {
  return {
    moduleMetadata,
    template: defaultBlockHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Orange theme', () => {
  return {
    moduleMetadata,
    template: orangeBlockHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With tabs', () => {
  return {
    moduleMetadata,
    template: tabsBlockHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With middle tabs', () => {
  return {
    moduleMetadata,
    template: middleTabsHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Without title', () => {
  return {
    moduleMetadata,
    template: withoutTitleHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Transparent theme without title', () => {
  return {
    moduleMetadata,
    template: transparentBlockWithoutTitleHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Without title border', () => {
  return {
    moduleMetadata,
    template: titleBorderlessHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Loading state', () => {
  return {
    moduleMetadata,
    template: '<block loading="true"></block>',
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
