# Map

## Usage

```html
<map options="options" markers="markers"></map>
```

## Map properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| options | - | - | object | Map options
| markers | - | - | object | Map markers data

```javascript
const options: Object = {
  centerLat: 59.4371821, // Uses EST center if not specified
  centerLng: 24.7450143,
  zoom: 11,
  maxZoom: 11,
  minZoom: 11,
  bottomAction: true,
  zoomControl: false,
  streetViewControl: false,
  mapDraggable: false,
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
```