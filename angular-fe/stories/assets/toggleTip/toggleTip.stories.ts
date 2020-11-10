import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets/Toggletip', module);

stories.add('Auto', () => {

  return {
    moduleMetadata,
    template: `<div style="display: flex; width: 100%; min-height: 25rem; justify-content: center; align-items: center;">
      <toggle-tip placement="auto">
        <span>i</span>
        <div id="content">toggletip content</div>
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
      <toggle-tip placement="right">
        <span>i</span>
        <div id="content">toggletip content</div>
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
      <toggle-tip placement="left">
        <span>i</span>
        <div id="content">toggletip content</div>
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
      <toggle-tip placement="bottom">
        <span>i</span>
        <div id="content">toggletip content</div>
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
      <toggle-tip placement="top">
        <span>i</span>
        <div id="content">toggletip content</div>
      </toggle-tip>
    </div>`,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
