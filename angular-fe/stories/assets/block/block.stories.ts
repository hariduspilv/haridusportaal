import { storiesOf } from '@storybook/angular';
import blockMd from './block.md';

import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { AssetsModule } from '@app/_assets';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Block', () => {

  const theme = select(
    'Theme',
    {
      Default: 'default',
      Orange: 'orange',
    },
    'default',
  );

  const titleBorder = options(
    'Title border',
    {
      Yes: 'yes',
      No: 'no',
    },
    'yes',
    {
      display: 'inline-radio',
    });

  const tabs = options(
    'Tabs',
    {
      Yes: 'yes',
      No: 'no',
    },
    'yes',
    {
      display: 'inline-radio',
    });

  const tabStyle = select(
    'Tab style',
    {
      Default: 'default',
      Middle: 'middle',
    },
    'default',
  );

  const title = options(
    'Title',
    {
      Yes: 'yes',
      No: 'no',
    },
    'yes',
    {
      display: 'inline-radio',
    });

  const loading = options(
    'Loading',
    {
      Yes: 'yes',
      No: 'no',
    },
    'no',
    {
      display: 'inline-radio',
    });

  return {
    moduleMetadata,
    props: {
      theme,
      tabStyle,
      loading,
      titleBorder,
      tabs,
      title,
    },
    template: `
      <block [titleBorder]="titleBorder == 'yes'" [tabStyle]="tabStyle"
      [theme]="theme" [loading]="loading == 'yes'"
      *ngIf="tabs == 'yes' && title == 'yes'">
        <block-title>
          Kasti pealkiri läheb siia
        </block-title>
        <block-content tabLabel="Ametialad" tabIcon="grid">
          <p>Officia laboris cillum minim fugiat pariatur nisi tempor
          quis dolor cillum amet dolor cupidatat.
          Tempor cupidatat labore ullamco voluptate duis nisi nulla.
          Aliqua nisi in cupidatat qui fugiat aute nulla veniam nisi.
          In exercitation nisi sunt enim.</p>
          <p>Ut pariatur nisi eu cupidatat ut aliquip.
          Veniam sit veniam proident non quis consectetur cillum
          et sit aliquip elit ipsum duis laborum. Enim cillum amet
          consectetur veniam nulla aliqua qui. Sit officia qui do
          sit et. Amet minim laborum adipisicing ea exercitation
          adipisicing pariatur excepteur. Veniam amet laborum
          deserunt officia sit pariatur consectetur. Lorem qui
          occaecat elit deserunt sint consectetur labore minim
          ea in occaecat.</p>
          <p>Ipsum consectetur deserunt fugiat enim ex. Ex
          laboris qui eu in tempor aliqua reprehenderit nulla.
          Minim amet ullamco eiusmod do reprehenderit minim velit
          ipsum sint. Do duis culpa laborum commodo ullamco dolore
          qui. Id aute reprehenderit ad in elit laboris fugiat
          reprehenderit sit. Cillum incididunt occaecat mollit
          nulla voluptate fugiat sunt qui irure eu veniam amet non ullamco.
          Deserunt eiusmod nisi sunt enim deserunt cillum ad.</p>
        </block-content>
        <block-content tabLabel="Andmed" tabIcon="database">
          <p>Ut pariatur nisi eu cupidatat ut aliquip.
          Veniam sit veniam proident non quis consectetur cillum
          et sit aliquip elit ipsum duis laborum. Enim cillum amet
          consectetur veniam nulla aliqua qui. Sit officia qui do
          sit et. Amet minim laborum adipisicing ea exercitation
          adipisicing pariatur excepteur. Veniam amet laborum
          deserunt officia sit pariatur consectetur. Lorem qui
          occaecat elit deserunt sint consectetur labore minim
          ea in occaecat.</p>
          <p>Ipsum consectetur deserunt fugiat enim ex. Ex
          laboris qui eu in tempor aliqua reprehenderit nulla.
          Minim amet ullamco eiusmod do reprehenderit minim velit
          ipsum sint. Do duis culpa laborum commodo ullamco dolore
          qui. Id aute reprehenderit ad in elit laboris fugiat
          reprehenderit sit. Cillum incididunt occaecat mollit
          nulla voluptate fugiat sunt qui irure eu veniam amet non ullamco.
          Deserunt eiusmod nisi sunt enim deserunt cillum ad.</p>
        </block-content>
      </block>

      <block [titleBorder]="titleBorder == 'yes'" [theme]="theme" [loading]="loading == 'yes'"
      *ngIf="tabs == 'no' && title == 'yes'">
        <block-title>
          Kasti pealkiri läheb siia
        </block-title>
        <block-content>
          <p>Officia laboris cillum minim fugiat pariatur nisi tempor
          quis dolor cillum amet dolor cupidatat.
          Tempor cupidatat labore ullamco voluptate duis nisi nulla.
          Aliqua nisi in cupidatat qui fugiat aute nulla veniam nisi.
          In exercitation nisi sunt enim.</p>
          <p>Ut pariatur nisi eu cupidatat ut aliquip.
          Veniam sit veniam proident non quis consectetur cillum
          et sit aliquip elit ipsum duis laborum. Enim cillum amet
          consectetur veniam nulla aliqua qui. Sit officia qui do
          sit et. Amet minim laborum adipisicing ea exercitation
          adipisicing pariatur excepteur. Veniam amet laborum
          deserunt officia sit pariatur consectetur. Lorem qui
          occaecat elit deserunt sint consectetur labore minim
          ea in occaecat.</p>
          <p>Ipsum consectetur deserunt fugiat enim ex. Ex
          laboris qui eu in tempor aliqua reprehenderit nulla.
          Minim amet ullamco eiusmod do reprehenderit minim velit
          ipsum sint. Do duis culpa laborum commodo ullamco dolore
          qui. Id aute reprehenderit ad in elit laboris fugiat
          reprehenderit sit. Cillum incididunt occaecat mollit
          nulla voluptate fugiat sunt qui irure eu veniam amet non ullamco.
          Deserunt eiusmod nisi sunt enim deserunt cillum ad.</p>
        </block-content>
      </block>

      <block [titleBorder]="titleBorder == 'yes'" [theme]="theme"
      *ngIf="title == 'no'">
        <block-content>
          <p>Officia laboris cillum minim fugiat pariatur nisi tempor
          quis dolor cillum amet dolor cupidatat.
          Tempor cupidatat labore ullamco voluptate duis nisi nulla.
          Aliqua nisi in cupidatat qui fugiat aute nulla veniam nisi.
          In exercitation nisi sunt enim.</p>
          <p>Ut pariatur nisi eu cupidatat ut aliquip.
          Veniam sit veniam proident non quis consectetur cillum
          et sit aliquip elit ipsum duis laborum. Enim cillum amet
          consectetur veniam nulla aliqua qui. Sit officia qui do
          sit et. Amet minim laborum adipisicing ea exercitation
          adipisicing pariatur excepteur. Veniam amet laborum
          deserunt officia sit pariatur consectetur. Lorem qui
          occaecat elit deserunt sint consectetur labore minim
          ea in occaecat.</p>
          <p>Ipsum consectetur deserunt fugiat enim ex. Ex
          laboris qui eu in tempor aliqua reprehenderit nulla.
          Minim amet ullamco eiusmod do reprehenderit minim velit
          ipsum sint. Do duis culpa laborum commodo ullamco dolore
          qui. Id aute reprehenderit ad in elit laboris fugiat
          reprehenderit sit. Cillum incididunt occaecat mollit
          nulla voluptate fugiat sunt qui irure eu veniam amet non ullamco.
          Deserunt eiusmod nisi sunt enim deserunt cillum ad.</p>
        </block-content>
      </block>
    `,
  };
},          {
  notes: { markdown: blockMd },
});
