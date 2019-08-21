import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import mapMd from './map.md';
import { TranslateModule } from '@app/_modules/translate';
import {
  withKnobs,
  optionsKnob as options,
  select,
  object,
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
  const typeControl = select(
    'Type',
    {
      Markerid: 'markers',
      Polügoonid: 'polygons',
    },
    'markers',
  );
  const polygonType = select(
    'Polygon type',
    {
      Investeeringud: 'investment',
      Valdkonnad: 'fields',
    },
    'investment',
  );
  const zoomLevel = number('Zoom', 7, numberOptions);
  const minZoomLevel = number('Min zoom', 7, numberOptions);
  const maxZoomLevel = number('Max zoom', 15, numberOptions);
  const bottomAction = options('Bottom action', { Yes: 'yes', No: 'no' }, 'no', {
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
  const mapLabelsControl = options('Map labels', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const legendControl = options('Legend', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const extraPolygonLabels = options('Polygon extra labels', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const layerControl = options('Polygon layer selection', { Yes: 'yes', No: 'no' }, 'yes', {
    display: 'inline-radio',
  });
  const optionsData: Object = {
    // centerLat: 59.4371821,
    // centerLng: 24.7450143,
    zoom: zoomLevel,
    maxZoom: maxZoomLevel,
    minZoom: minZoomLevel,
    mapDraggable: mapDraggable === 'yes',
    bottomAction: bottomAction === 'yes',
    zoomControl: zoomControl === 'yes',
    streetViewControl: streetViewControl === 'yes',
    mapLabelsControl: mapLabelsControl === 'yes',
    type: typeControl,
    legendControl: legendControl === 'yes',
    layerControl: layerControl === 'yes',
    extraPolygonLabels: extraPolygonLabels === 'yes',
  };
  const markerData: Object[] = [
    {
      Nid: '43352',
      Lat: '59.351103430836',
      Lon: '24.704273236562',
      EntityPath: '/kool/4t',
      info: {
        FieldSchoolName: '4T',
        FieldSchoolWebpageAddress: 'http://www.4t.ee',
        FieldSchoolContactPhone: '5254973',
        FieldSchoolContactEmail: 'info@annetiits.eu',
        FieldSpecialClass: '1',
        FieldStudentHome: '0',
        FieldTeachingLanguage: null,
        FieldOwnershipType: 'Eraomand',
        FieldEducationalInstitutionTy: 'Täienduskoolitusasutus',
        FieldAddress: 'Tedre tn 81-55, Kristiine linnaosa, Tallinn, Harju maakond',
      },
    },
    {
      Nid: '43317',
      Lat: '58.731519093026',
      Lon: '26.213643653237',
      EntityPath: '/kool/5mpc',
      info: {
        FieldSchoolName: '5MPC',
        FieldSchoolWebpageAddress: 'http://rillo.ee/koolitused/',
        FieldSchoolContactPhone: '5040260',
        FieldSchoolContactEmail: 'marko@rillo.ee',
        FieldSpecialClass: '0',
        FieldStudentHome: '0',
        FieldTeachingLanguage: null,
        FieldOwnershipType: 'Eraomand',
        FieldEducationalInstitutionTy: 'Täienduskoolitusasutus',
        FieldAddress: null,
      },
    },
    {
      Nid: '42720',
      Lat: '59.349798056002',
      Lon: '24.735320229345',
      EntityPath: '/kool/5t-ohutuse-oü',
      info: {
        FieldSchoolName: '5T Ohutuse OÜ',
        FieldSchoolWebpageAddress: 'http://5t.ee',
        FieldSchoolContactPhone: '56670870',
        FieldSchoolContactEmail: 'info@5t.ee',
        FieldSpecialClass: '0',
        FieldStudentHome: '0',
        FieldTeachingLanguage: null,
        FieldOwnershipType: 'Eraomand',
        FieldEducationalInstitutionTy: 'Täienduskoolitusasutus',
        FieldAddress: 'Maikellukese tn 7, Kangru alevik, Kiili vald, Harju maakond',
      },
    },
  ];
  const polygonData: Object = {
    county: [
      {
        investmentLocation: 'Harju maakond',
        investmentAmountSum: 21000000,
      },
      {
        investmentLocation: 'Pärnu maakond',
        investmentAmountSum: 11054655,
      },
      {
        investmentLocation: 'Võru maakond',
        investmentAmountSum: 12300000,
      },
      {
        investmentLocation: 'Lääne-Viru maakond',
        investmentAmountSum: 12600000,
      },
    ],
    kov: [
      {
        investmentLocation: 'Harku vald',
        investmentAmountSum: 10500000,
      },
      {
        investmentLocation: 'Pärnu linn',
        investmentAmountSum: 11054655,
      },
      {
        investmentLocation: 'Võru vald',
        investmentAmountSum: 12300000,
      },
      {
        investmentLocation: 'Väike-Maarja vald',
        investmentAmountSum: 12600000,
      },
      {
        investmentLocation: 'Tallinn',
        investmentAmountSum: 10500000,
      },
    ],
  };
  const markers = object('Markers', markerData);
  const polygons = object('Polygons', polygonData);
  return {
    moduleMetadata,
    props: {
      polygons,
      optionsData,
      polygonType,
      markers,
    },
    template: `
      <map
        [polygonData]='polygons'
        [polygonType]='polygonType'
        [options]='optionsData'
        [markerData]='markers'>
      </map>
    `,
  };
},          {
  notes: { markdown: mapMd },
});
