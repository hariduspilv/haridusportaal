import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
  providers: [
    QueryParamsService,
    { provide: ActivatedRoute, useValue: {} },
  ],
};

const stories = storiesOf('Assets/Skeleton', module);

stories.add('Article', () => {

  return {
    moduleMetadata,
    template: `
      <skeleton type="article"></skeleton>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Line', () => {

  return {
    moduleMetadata,
    template: `
      <skeleton type="line"></skeleton>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
