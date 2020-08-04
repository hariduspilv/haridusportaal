import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import progressMd from './progress.md';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  text,
  optionsKnob as options,
  select,
} from '@storybook/addon-knobs';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Progress', () => {
  const start = text('Starting label', 'Kerge');
  const end = text('Ending label', 'Raske');
  const status = text('Status label', 'Staatus');
  const level = select(
    'Level',
    {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
    1,
  );
  return {
    moduleMetadata,
    props: {
      level,
      start,
      end,
      status,
    },
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        [level]="level"
        [id]="level"
        [statusLabel]="status"
        [startLabel]="start"
        [endLabel]="end">
      </progress-bar>
    `,
  };
},          {
  notes: { markdown: progressMd },
});
