import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import formItemMd from './formItem.md';
import { TranslateModule } from '@app/_modules/translate';
import { LOCALE_ID } from '@angular/core';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEt);

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue:'et' },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Form item', () => {

  const change = (event) => {
    console.log(event);
  };

  const formItems = [
    {
      type: 'text',
      title: 'Text field',
      value: 'Initial value', /* Testing initial value */
    },
    {
      type: 'text',
      title: 'Text field with placeholder',
      placeholder: 'Start Typing',
    },
    {
      type: 'date',
      title: 'Datepicker field',
      placeholder: 'pp.kk.aaaa',
    },
    {
      type: 'select',
      title: 'Select',
      placeholder: 'Select an option',
      options: [
        {
          key: 'Option 1',
          value: '1',
        },
        {
          key: 'Option 2',
          value: '2',
        },
      ],
    },
    {
      type: 'textarea',
      title: 'Textarea',
    },
  ];

  return {
    moduleMetadata,
    props: {
      change,
      formItems,
    },
    // tslint:disable: max-line-length
    template: `
      <table htm-table>
        <tr>
          <th>
            Form item
          </th>
          <th>
            Model value
          </th>
        </tr>
        <tr *ngFor="let item of formItems">
          <td><formItem [type]="item.type" [(ngModel)]="item.value" [placeholder]="item.placeholder" [title]="item.title" [options]="item.options"></formItem></td>
          <td>{{ item.value }}</td>
        </tr>
      </table>
    `,
  };
},          {
  notes: { markdown: formItemMd },
});
