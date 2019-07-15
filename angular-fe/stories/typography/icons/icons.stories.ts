import { storiesOf } from '@storybook/angular';
import { icons } from './icons';
import iconsMd from './icons.md';
import { AssetsModule } from '@app/_assets';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Typography', module);
stories.add('Icons', () => {

  const iconsHTML = icons.map((icon) => {
    return `
      <tr>
        <td style="text-align:center;"><icon size="large" glyph="${icon._name}"></icon></td>
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
