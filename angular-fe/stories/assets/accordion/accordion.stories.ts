import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import accordionMd from './accordion.md';
import {
  withKnobs,
  optionsKnob as options,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);
stories.add('Accordion', () => {

  const collapsible = options(
    'Collapsible',
    {
      True: '1',
      False: '0',
    },
    '0',
    {
      display: 'inline-radio',
    });

  return {
    moduleMetadata,
    props: {
      collapsible,
    },
    template: `
      <accordion [collapsible]="collapsible == '1'">
        <accordion-item title="First accordion block with a looooooooooooooong title">
        <p>Officia laboris cillum minim fugiat pariatur nisi tempor
        quis dolor cillum amet dolor cupidatat.
        Tempor cupidatat labore ullamco voluptate duis nisi nulla.
        Aliqua nisi in cupidatat qui fugiat aute nulla veniam nisi.
        In exercitation nisi sunt enim.</p>
        <p>Ut pariatur nisi eu cupidatat ut aliquip.
        Veniam sit veniam proident non quis consectetur cillum
        et sit aliquip elit ipsum duis laborum. Enim cillum amet
        consectetur veniam nulla aliqua qui. Sit officia qui do
        sit et. Amet minim laborum adipisicing ea exercitation
        adipisicing pariatur excepteur. Veniam amet laborum
        deserunt officia sit pariatur consectetur. Lorem qui
        occaecat elit deserunt sint consectetur labore minim
        ea in occaecat.</p>
        </accordion-item>
        <accordion-item title="Second">
          <p>BOOOOO!</p>
        </accordion-item>
        <accordion-item title="Third">
          <p>BOOOOO!</p>
        </accordion-item>
        <accordion-item title="Fourth">
          <p>einz zwei</p>
        </accordion-item>
      </accordion>
    `,
  };
},          {
  notes: { markdown: accordionMd },
});
