import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { LOCALE_ID } from '@angular/core';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
import { formItems } from './formItem.data';
import templateHtml from './template.html';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '@app/_services/AddressService';
import { AppPipes } from '@app/_pipes';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

localeEt[5][1] = localeEt[5][2].map((item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
});
registerLocaleData(localeEt);

const moduleMetadata = {
  imports: [
    AppPipes,
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    AddressService,
    { provide: LOCALE_ID, useValue:'et' },
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const textInputStories = storiesOf('Assets/Form items/Text input', module);
const numberInputStories = storiesOf('Assets/Form items/Number input', module);
const dateInputStories = storiesOf('Assets/Form items/Datepicker', module);
const textareaStories = storiesOf('Assets/Form items/Textarea', module);
const multiselectStories = storiesOf('Assets/Form items/Multiselect', module);
const selectStories = storiesOf('Assets/Form items/Select', module);
const checkboxStories = storiesOf('Assets/Form items/Checkbox', module);
const radioStories = storiesOf('Assets/Form items/Radio', module);

/**
 * @description Text input stories
 */
textInputStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.text,
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textInputStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.text, disabled: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textInputStories.add('Disabled title', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.textDisabledTitle,
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textInputStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.text, error: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textInputStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.text, success: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Number input stories
 */
numberInputStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.number,
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

numberInputStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.number, disabled: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

numberInputStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.number, error: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

numberInputStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.number, success: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Date input stories
 */
dateInputStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.date,
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

dateInputStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.date, disabled: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

dateInputStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.date, error: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

dateInputStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.date, success: true },
    },
    template: templateHtml,
  };
},                   {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Textarea stories
 */
textareaStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.textarea,
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textareaStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.textarea, disabled: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textareaStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.textarea, error: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

textareaStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.textarea, success: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Multiselect stories
 */
multiselectStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.multiselect,
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

multiselectStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.multiselect, disabled: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

multiselectStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.multiselect, error: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

multiselectStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.multiselect, success: true },
    },
    template: templateHtml,
  };
},                     {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Select stories
 */
selectStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.select,
    },
    template: templateHtml,
  };
},                {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

selectStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.select, disabled: true },
    },
    template: templateHtml,
  };
},                {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

selectStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.select, error: true },
    },
    template: templateHtml,
  };
},                {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

selectStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.select, success: true },
    },
    template: templateHtml,
  };
},                {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Checkbox stories
 */
checkboxStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.checkbox,
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

checkboxStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.checkbox, disabled: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

checkboxStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.checkbox, error: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

checkboxStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.checkbox, success: true },
    },
    template: templateHtml,
  };
},                  {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

/**
 * @description Radio stories
 */
radioStories.add('Default', () => {
  return {
    moduleMetadata,
    props: {
      item: formItems.radio,
    },
    template: templateHtml,
  };
},               {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

radioStories.add('Disabled', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.radio, disabled: true },
    },
    template: templateHtml,
  };
},               {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

radioStories.add('With errors', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.radio, error: true },
    },
    template: templateHtml,
  };
},               {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

radioStories.add('With success', () => {
  return {
    moduleMetadata,
    props: {
      item: { ...formItems.radio, success: true },
    },
    template: templateHtml,
  };
},               {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
