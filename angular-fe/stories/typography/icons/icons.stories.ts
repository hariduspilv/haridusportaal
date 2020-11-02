import { storiesOf } from '@storybook/angular';
import { icons } from './icons';
import iconsMd from './icons.md';
import { AssetsModule } from '@app/_assets';
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

const stories = storiesOf('Typography/Icons', module);

stories.add('Default', () => {
  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;">
          <icon glyph="${icon._name}" size="default"></icon>
        </td>
        <td>${icon._name}</td>
        <td>${icon._fileName}</td>
      </tr>
    `;
  }).join('');

  return {
    moduleMetadata,
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

stories.add('Medium', () => {
  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;">
          <icon glyph="${icon._name}" size="medium"></icon>
        </td>
        <td>${icon._name}</td>
        <td>${icon._fileName}</td>
      </tr>
    `;
  }).join('');

  return {
    moduleMetadata,
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

stories.add('Large', () => {
  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;">
          <icon glyph="${icon._name}" size="large"></icon>
        </td>
        <td>${icon._name}</td>
        <td>${icon._fileName}</td>
      </tr>
    `;
  }).join('');

  return {
    moduleMetadata,
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

stories.add('With background', () => {
  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;">
          <icon glyph="${icon._name}" [bg]="true" size="default"></icon>
        </td>
        <td>${icon._name}</td>
        <td>${icon._fileName}</td>
      </tr>
    `;
  }).join('');

  return {
    moduleMetadata,
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
