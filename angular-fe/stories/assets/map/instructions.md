# Map

## Usage

```html
<map 
  type="markers"
  [options]="options"
  [markers]="markers">
</map>
```

## Map properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| type | - | 'markers', 'polygons' | String | Map type
| options | - | - | Object | Map options
| markers | - | - | Object[] | Map markers data
| polygonData | - | - | Object | Polygon map data
| parameters | - | - | Object[] | Query parameters to show over map

```javascript
const options: Object = {
  polygonType: 'investment', // ...
  centerLat: 59.4371821, // Uses EST center if not specified
  centerLng: 24.7450143,
  zoom: 11,
  maxZoom: 11,
  minZoom: 11,
  draggable: true,
  zoomControl: false,
  streetViewControl: false,
  showOuterLink: true,
  showLabels: true,
  showParameters: false,
  showPolygonLayerSelection: false,
  showPolygonLegend: false
  enablePolygonModal: false,
};

const markers: Object[] = [
  {
    Nid: '43317',
    Lat: null,
    Lon: null,
    EntityPath: '/kool/5mpc',
    info: {
      FieldSchoolName: '5MPC',
      FieldOwnershipType: 'Eraomand',
      FieldEducationalInstitutionTy: 'Täienduskoolitusasutus',
    },
  },
];

const polygonData: Object = {
  county: [
    {
      investmentLocation: 'Harju maakond',
      investmentAmountSum: 21000000,
    },
  ],
  kov: [
    {
      investmentLocation: 'Harku vald',
      investmentAmountSum: 10500000,
    },
  ],
};

const parameters: Object[] = [
  {
    label: 'Näitaja',
    value: 'Hõivatute arv Eestis',
  },
  {
    label: 'Valdkond',
    value: 'Kalameeste klubi',
  },
];
```