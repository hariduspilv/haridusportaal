import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

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

const stories = storiesOf('Assets/Progress Bar', module);

stories.add('Level 1', () => {
  return {
    moduleMetadata,
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        level="1"
        id="1"
        statusLabel="Staatus"
        startLabel="Kerge"
        endLabel="Raske">
      </progress-bar>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Level 2', () => {
  return {
    moduleMetadata,
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        level="2"
        id="2"
        statusLabel="Staatus on ikka tõesti pikem silt"
        startLabel="Kerge pikem silt"
        endLabel="Raske pikem silt">
      </progress-bar>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Level 3', () => {
  return {
    moduleMetadata,
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        level="3"
        id="3"
        statusLabel="Staatus"
        startLabel="Kerge"
        endLabel="Raske">
      </progress-bar>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Level 4', () => {
  return {
    moduleMetadata,
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        level="4"
        id="4"
        statusLabel="Staatus"
        startLabel="Kerge"
        endLabel="Raske">
      </progress-bar>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Level 5', () => {
  return {
    moduleMetadata,
    template: `
      <progress-bar style="padding: 3rem 1rem; display: block;"
        level="5"
        id="5"
        statusLabel="Staatus"
        startLabel="Kerge"
        endLabel="Raske">
      </progress-bar>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
