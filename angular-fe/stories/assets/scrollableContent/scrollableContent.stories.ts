import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './table.data';
import { RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    RippleService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Scrollable content', module);

stories.add('Default', () => {

  const origFields = Object.keys(data[0]);
  const fields = [...origFields];
  const tmpData = data.slice(0, 40);
  return {
    moduleMetadata,
    props: {
      fields,
      data: tmpData,
    },
    template: `
      <style>
        th.title{width:300px;}
      </style>
      <scrollableContent>
        <table htm-table>
          <tr>
            <ng-container *ngFor="let item of fields">
              <th [ngClass]="item">{{ item | titlecase }}</th>
            </ng-container>
          </tr>
          <tr *ngFor="let item of data">
            <ng-container *ngFor="let field of fields">
              <td [ngClass]="field">
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
            </ng-container>
          </tr>
        </table>
      </scrollableContent>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
