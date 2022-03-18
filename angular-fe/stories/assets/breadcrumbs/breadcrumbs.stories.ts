import { storiesOf } from '@storybook/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import documentationMd from './documentation.md';
import instructionsMd from './instructions.md';
import { AssetsModule } from '@app/_assets';
import { RippleService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { TitleService } from "@app/_services/TitleService";

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    CommonModule,
  ],
  providers: [
    RippleService,
    TranslateService,
		TitleService,
  ],
};

const stories = storiesOf('Assets/Breadcrumbs', module);

stories.add('Short', () => {

  const short = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Sündmused',
    },
  ];

  return {
    moduleMetadata,
    props: { short },
    template: `
      <breadcrumbs [data]="short"></breadcrumbs>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Medium', () => {

  const medium = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Sündmused',
      link: 'sündmused',
    },
    {
      title: '"Edu Valem" Erakool',
    },
  ];

  return {
    moduleMetadata,
    props: { medium },
    template: `
      <breadcrumbs [data]="medium"></breadcrumbs>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('Long', () => {

  const long = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Sündmused',
      link: 'sündmused',
    },
    {
      title: '"Edu Valem" Erakool',
      link: 'sündmused/edu_valem',
    },
    {
      title: 'Valemi tähtis info',
      link: 'sündmused/edu_valem/valemi_tähtis_info',
    },
    {
      title: 'Valem',
    },
  ];

  return {
    moduleMetadata,
    props: { long },
    template: `
      <breadcrumbs [data]="long"></breadcrumbs>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
