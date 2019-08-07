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
  name: 'Raekoja plats 1',
  centerLat: 59.4371821,
  centerLng: 24.7450143,
  zoom: 11,
  maxZoom: 11,
  minZoom: 11,
  bottomAction: true,
  zoomControl: false,
  streetViewControl: false,
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
```