import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import formItemMd from './formItem.md';
import { TranslateModule } from '@app/_modules/translate';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Form item', () => {

  return {
    moduleMetadata,
    props: {
      nid: 48788,
    },
    // tslint:disable: max-line-length
    template: `
      <formItem type="text" title="Text field with placeholder" placeholder="Start typing"></formItem>
      <formItem type="text" title="Text field without placeholder"></formItem>
      <formItem type="date" title="Alguskuupäev" placeholder="pp.kk.aaaa"></formItem>
      <formItem type="textarea" title="Textarea"></formItem>
      <formItem type="select" [options]="data" title="Select with placeholder" placeholder="Vali väärtus"></formItem>
      <formItem type="select" [options]="data" title="Select without placeholder"></formItem>
    `,
  };
},          {
  notes: { markdown: formItemMd },
});
