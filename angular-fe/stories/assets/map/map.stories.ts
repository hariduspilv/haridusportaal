import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import mapMd from './map.md';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  optionsKnob as options,
  number,
} from '@storybook/addon-knobs';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);
stories.addDecorator(withKnobs);

stories.add('Map', () => {
  const numberOptions = {
    range: true,
    min: 1,
    max: 20,
    step: 1,
  };
  const zoomLevel = number('Zoom', 11, numberOptions);
  const minZoomLevel = number('Min zoom', 11, numberOptions);
  const maxZoomLevel = number('Max zoom', 11, numberOptions);
  const bottomAction = options('Bottom action', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const mapDraggable = options('Draggable map', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const zoomControl = options('Zoom control', { Yes: 'yes', No: 'no' }, 'no', {
    display: 'inline-radio',
  });
  const streetViewControl = options('Street View control', { Yes: 'yes', No: 'no' }, 'no', {
    display: 'inline-radio',
  });
  const optionsData: Object = {
    name: 'Raekoja plats 1',
    centerLat: 59.4371821,
    centerLng: 24.7450143,
    zoom: zoomLevel,
    maxZoom: maxZoomLevel,
    minZoom: minZoomLevel,
    mapDraggable: mapDraggable === 'yes',
    bottomAction: bottomAction === 'yes',
    zoomControl: zoomControl === 'yes',
    streetViewControl: streetViewControl === 'yes',
  };
  const markers: Object[] = [
    {
      nid: 45547,
      latitude: 59.4371821,
      longitude: 24.7450143,
      popup: {
        // ...
        content: 'Sisu',
        title: 'W00t',
      },
    },
  ];
  return {
    moduleMetadata,
    props: {
      optionsData,
      markers,
    },
    template: `
      <map [options]="optionsData" [markers]="markers"></map>
    `,
  };
},          {
  notes: { markdown: mapMd },
});
