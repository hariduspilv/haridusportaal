import { storiesOf } from '@storybook/angular';
import { icons } from './icons';
import iconsMd from './icons.md';
import { AssetsModule } from '@app/_assets';
import {
  withKnobs,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Typography', module);
stories.addDecorator(withKnobs);
stories.add('Icons', () => {

  const background = options(
    'Background',
    {
      Yes: 'yes',
      No: 'no',
    },
    'no',
    {
      display: 'inline-radio',
    },
  );
  const size = select(
    'Size',
    {
      Default: 'default',
      Medium: 'medium',
      Large: 'large',
    },
    'default',
  );
  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;">
          <icon glyph="${icon._name}" [bg]="background === 'yes'" [size]="size"></icon>
        </td>
        <td>${icon._name}</td>
        <td>${icon._fileName}</td>
      </tr>
    `;
  }).join('');

  return {
    moduleMetadata,
    props: {
      background,
      size,
    },
    template: `
      <div class="center">
        <h1>Icons (${icons.length})</h1>
        <table htm-table>
          <tr>
            <th width="20px">Icon</th>
            <th width="20px">Name</th>
            <th>Filename</th>
          </tr>
          ${iconsHTML}
        </table>
      </div>
    `,
  };
},          {
  notes: { markdown: iconsMd },
});
