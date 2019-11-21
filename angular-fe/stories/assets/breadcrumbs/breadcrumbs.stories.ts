import { storiesOf } from '@storybook/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { withKnobs, select } from '@storybook/addon-knobs';
import breadcrumbsMd from './breadcrumbs.md';
import { AssetsModule } from '@app/_assets';
import { RippleService } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    CommonModule,
  ],
  providers: [
    RippleService,
  ]
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Breadcrumbs', () => {

  const small = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Sündmused',
    },
  ];

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

  const large = [
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

  const steps = select(
    'Size',
    {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    },
    'small',
  );

  return {
    moduleMetadata,
    props: {
      small,
      medium,
      large,
      steps,
    },
    template: `
      <breadcrumbs [data]="small" *ngIf="steps == 'small'"></breadcrumbs>
      <breadcrumbs [data]="medium" *ngIf="steps == 'medium'"></breadcrumbs>
      <breadcrumbs [data]="large" *ngIf="steps == 'large'"></breadcrumbs>
    `,
  };
},          {
  notes: { markdown: breadcrumbsMd },
});
