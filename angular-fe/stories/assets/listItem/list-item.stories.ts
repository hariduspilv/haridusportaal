import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import listItemHtml from './list-item.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './list-item.data';
import { ModalService } from '@app/_services';
import { RouterTestingModule } from '@angular/router/testing';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    ModalService,
  ],
};

const stories = storiesOf('Assets/List item', module);

stories.add('Default', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: listItemHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
