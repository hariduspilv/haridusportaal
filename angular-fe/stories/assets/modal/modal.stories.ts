import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import modalMd from './modal.md';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  optionsKnob as options,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add(
  'Modal', () => {
    const topAction = options(
      'Upper close',
      {
        Yes: 'yes',
        No: 'no',
      },
      'yes',
      {
        display: 'inline-radio',
      },
    );
    const bottomAction = options(
      'Lower close',
      {
        Yes: 'yes',
        No: 'no',
      },
      'yes',
      {
        display: 'inline-radio',
      },
    );
    const titleExists = options(
      'Title',
      {
        Yes: 'yes',
        No: 'no',
      },
      'yes',
      {
        display: 'inline-radio',
      },
    );
    return {
      moduleMetadata,
      props: {
        titleExists,
        topAction,
        bottomAction,
      },
      template: `
          <htm-modal id="modal-1" title="Esimene pealkiri" [titleExists]="titleExists === 'yes'"
          [topAction]="topAction === 'yes'" [bottomAction]="bottomAction === 'yes'"
          [stateButton]="true">
            <modal-content>
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
              </table>
            </modal-content>
          </htm-modal>
          <htm-modal id="modal-2" title="Pealkiri" [titleExists]="titleExists === 'yes'"
          [topAction]="topAction === 'yes'" [bottomAction]="bottomAction === 'yes'"
          [stateButton]="true">
            <modal-content>
              <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti
                quos dolores et quas molestias excepturi sint occaecati
                cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia ani
                id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
                distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
                impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda
                est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut
                rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae no
                recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
                maiores alias consequatur aut perferendis doloribus asperiores repellat.
              </p>
            </modal-content>
          </htm-modal>
          <htm-modal id="loader" title="Failure is apparently an option"
          [titleExists]="titleExists === 'yes'" [topAction]="topAction === 'yes'"
          [bottomAction]="bottomAction === 'yes'" [stateButton]="true">
            <modal-content>
              <loader></loader>
            </modal-content>
          </htm-modal>
        `,
    };
  },
  {
    notes: { markdown: modalMd },
  },
);
