import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import tableMd from './table.md';
import { data } from './table.data';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Table', () => {

  const fields = Object.keys(data[0]);
  return {
    moduleMetadata,
    props: {
      data,
      fields,
    },
    template: `
      <table htm-table>
        <tr>
          <th *ngFor="let item of fields">{{ item | titlecase }}</th>
        </tr>
        <tr *ngFor="let item of data">
          <td *ngFor="let field of fields">
            <ng-container [ngSwitch]="field">
              <ng-container *ngSwitchCase="'sex'">
                <span *ngIf="item[field] == 'm'">Male</span>
                <span *ngIf="item[field] == 'f'">Female</span>
              </ng-container>
              <ng-container *ngSwitchDefault>
                {{ item[field] }}
              </ng-container>
            </ng-container>
          </td>
        </tr>
      </table>
    `,
  };
},          {
  notes: { markdown: tableMd },
});
