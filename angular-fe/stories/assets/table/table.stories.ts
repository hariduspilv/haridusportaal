import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import tableMd from './table.md';
import { data } from './table.data';
import { ActivatedRoute } from '@angular/router';
import { QueryParamsService } from '@app/_services/QueryParams.service';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Table', () => {

  const fields = Object.keys(data[0]);
  const tmpData = data.splice(0, 5);
  const tmpData2 = data.splice(0, 3);
  return {
    moduleMetadata,
    props: {
      fields,
      data: tmpData,
      data2: tmpData2,
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

      <div style="height:20px;"></div>

      <table htm-table>
        <tr *ngFor="let field of fields">
          <th>{{ field | titlecase }}</th>
          <td *ngFor="let item of data2">
            {{ item[field] }}
          </td>
        </tr>
      </table>
    `,
  };
},          {
  notes: { markdown: tableMd },
});
