import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import colorsHtml from './colors.html';
import colorsScss from '../../../src/app/scss/colors.scss';
import colorsMd from './colors.md';
import { TranslateService } from '@app/_modules/translate/translate.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    TranslateService,
  ],
};

const stories = storiesOf('Typography', module);

stories.add('Colors', () => {

  let colors:any = colorsScss.replace(/\r?\n|\r/g, '').replace(/\s/g, '').match(/\.(.*?)\}/gm);
  const colorsObj = {};

  colors = colors.map((item) => {
    const color = /:([^;]+);/gm.exec(item)[1];
    const name = /color-([^;]+){/gm.exec(item)[1];
    colorsObj[color] = name;
    return color;
  });

  const count = colors.length;
  return {
    moduleMetadata,
    props: {
      colors,
      colorsObj,
      count,
      searchField: '',
    },
    template: colorsHtml,
  };
},          {
  notes: { markdown: colorsMd },
});
