import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { TranslateModule } from '@app/_modules/translate';
import { ActivatedRoute } from "@angular/router";
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
	providers: [
		{ provide: ActivatedRoute, useValue: {}	},
	],
};

const stories = storiesOf('Assets/Toggletip', module);

stories.add('Auto', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="auto" [content]="'oska.fieldNumberEmployed_explanation' | translate">
        <span>i</span>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Right', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="right" [content]="'oska.fieldNumberEmployed_explanation' | translate">
        <span>i</span>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Left', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="left" [content]="'oska.fieldNumberEmployed_explanation' | translate">
        <span>i</span>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Bottom', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="bottom" [content]="'oska.fieldNumberEmployed_explanation' | translate">
        <span>i</span>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('top', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="top" [content]="'oska.fieldNumberEmployed_explanation' | translate">
        <span>i</span>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
