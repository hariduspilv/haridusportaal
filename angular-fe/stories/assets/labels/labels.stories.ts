import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import colorsScss from '../../../src/app/scss/colors.scss';
import labelsMd from './labels.md';
import {
  withKnobs,
  object,
  select,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Labels', () => {
  let colors:any = colorsScss.replace(/\r?\n|\r/g, '').replace(/\s/g, '').match(/\.(.*?)\}/gm);
  const colorsObj = {};
  colors = colors.map((item) => {
    const color = /:([^;]+);/gm.exec(item)[1];
    const name = /color-([^;]+){/gm.exec(item)[1];
    colorsObj[name] = color;
    return color;
  });
  const fieldTags = [
    {
      entity: {
        entityLabel: 'kala',
        tid: 2445,
      },
    },
    {
      entity: {
        entityLabel: 'kaos',
        tid: 2441,
      },
    },
    {
      entity: {
        entityLabel: 'õpetajate päev',
        tid: 2582,
      },
    },
  ];
  const type = select(
    'Type',
    {
      None: '',
      Plain: 'plain',
      Orange: 'orange',
      Aqua: 'aqua',
    },
    '',
  );
  const background = select(
    'Background color', colors, '#eeeeee',
  );
  const border = select(
    'Border color', colors, '#c7c7c9',
  );
  const data = object('Labels', fieldTags);
  return {
    moduleMetadata,
    props: {
      data,
      border,
      background,
      type,
    },
    template: `
      <labels [data]="data" [type]="type" [border]="border" [background]="background"></labels>
    `,
  };
},          {
  notes: { markdown: labelsMd },
});
