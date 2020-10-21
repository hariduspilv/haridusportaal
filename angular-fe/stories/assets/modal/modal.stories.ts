import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ModalService, RippleService } from '@app/_services';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '@app/_services/AddressService';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    ModalService,
    RippleService,
    AddressService,
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Modals', module);

stories.add(
  'With title and top close', () => {
    return {
      moduleMetadata,
      template: `
          <htm-modal id="search"
            modalTitle="Otsing"
            [initializeAsOpen]="true"
            [topAction]="true"
            [bottomAction]="false">
            <ng-template id="search">
              <formItem
                type="text"
                [(ngModel)]="searchString"
                title="Märksõna">
              </formItem>
              <button
                htm-button
                style="margin-top: 1rem; width: 100%;">
                  Otsi
              </button>
            </ng-template>
          </htm-modal>`,
    };
  },
  {
    notes: { Instructions: instructionsMd, Documentation: documentationMd },
  },
);

stories.add(
  'With bottom close and without title', () => {
    return {
      moduleMetadata,
      template: `
          <htm-modal id="modal-1"
            [titleExists]="false"
            [bottomAction]="true"
            [topAction]="false"
            [initializeAsOpen]="true">
            <ng-template id="modal-1">
              <table htm-table>
                <tr>
                  <th>Esimene</th>
                  <th>Teine</th>
                  <th>Veel 1</th>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
                <tr>
                  <td>See</td>
                  <td>Teine</td>
                  <td>Kolmas</td>
                </tr>
              </table>
            </ng-template>
          </htm-modal>
        `,
    };
  },
  {
    notes: { Instructions: instructionsMd, Documentation: documentationMd },
  },
);
