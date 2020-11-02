import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { RouterTestingModule } from '@angular/router/testing';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import { markerData } from './data/markers';
import { polygonData } from './data/polygons';
import { parameterData } from './data/parameters';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    RouterTestingModule,
  ],
  providers: [
    QueryParamsService,
  ],
};

const stories = storiesOf('Assets/Map', module);

stories.add('With markers, modal', () => {
  const optionsData: Object = {
    enableOuterLink: false,
    enableParameters: false,
    enableLayerSelection: false,
    enablePolygonLegend: false,
    zoom: 7.4,
    maxZoom: 16,
    draggable: true,
    enablePolygonModal: false,
    enableStreetViewControl: true,
    enableLabels: true,
  };
  return {
    moduleMetadata,
    props: {
      markerData,
      optionsData,
    },
    template: `
      <map
        type='markers'
        [options]='optionsData'
        [markers]='markerData'>
      </map>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With markers, disabled labels', () => {
  const optionsData: Object = {
    enableOuterLink: false,
    enableParameters: false,
    enableLayerSelection: false,
    enablePolygonLegend: false,
    zoom: 7.4,
    maxZoom: 16,
    draggable: true,
    enablePolygonModal: false,
    enableZoomControl: false,
    enableStreetViewControl: false,
    enableLabels: false,
  };
  return {
    moduleMetadata,
    props: {
      markerData,
      optionsData,
    },
    template: `
      <map
        type='markers'
        [options]='optionsData'
        [markers]='markerData'>
      </map>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With marker, outerLink and disabled controls', () => {
  const optionsData: Object = {
    zoom: 7.4,
    draggable: false,
    enableZoomControl: false,
    enableStreetViewControl: false,
    centerLat: 59.4371821,
    centerLng: 24.7450143,
    enableOuterLink: true,
    enableLabels: true,
    enablePolygonLegend: false,
    enablePolygonModal: false,
  };
  const marker = [markerData[0]];
  return {
    moduleMetadata,
    props: {
      optionsData,
      marker,
    },
    template: `
      <map
        type='markers'
        [options]='optionsData'
        [markers]='marker'>
      </map>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With polygons, modals and parameters', () => {
  const optionsData: Object = {
    polygonType: 'investment',
    zoom: 7,
    maxZoom: 15,
    minZoom: 7,
    draggable: true,
    enableZoomControl: true,
    enableStreetViewControl: false,
    enableOuterLink: false,
    enableLabels: false,
    enableParameters: true,
    enableLayerSelection: false,
    enablePolygonLegend: false,
    enablePolygonModal: true,
  };
  return {
    moduleMetadata,
    props: {
      optionsData,
      polygonData,
      parameterData,
    },
    template: `
      <map
        [polygonData]='polygonData'
        type='polygons'
        [options]='optionsData'
        [legendLabels]="{}"
        [parameters]="parameterData">
      </map>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});

stories.add('With polygons, text values and legend', () => {
  const optionsData: Object = {
    polygonType: 'investment',
    zoom: 7,
    maxZoom: 15,
    minZoom: 7,
    draggable: true,
    enableZoomControl: false,
    enableStreetViewControl: false,
    enableOuterLink: false,
    enableLabels: false,
    enableParameters: false,
    enableLayerSelection: true,
    enablePolygonLegend: true,
    enablePolygonModal: false,
  };
  const legendLabels = {
    'Hõivatute arv Eestis': {
      start: 'Mida keeksi skaala',
      end: 'Ei 1001',
    },
    'Kalameeste arv': {
      start: 'Plaaj plaajsdaöä',
      end: 'Kah sobib kakssadaneli',
    },
  };
  return {
    moduleMetadata,
    props: {
      optionsData,
      polygonData,
      parameterData,
      legendLabels,
    },
    template: `
      <map
        [polygonData]='polygonData'
        type='polygons'
        [options]='optionsData'
        [parameters]="parameterData"
        [legendLabels]="legendLabels">
      </map>
    `,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
