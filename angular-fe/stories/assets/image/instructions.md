# Images

## Usage

```html
<images [images]="data"></images>
```

## Properties

| Name   | Default | Values | Type  | Description       |
|--------|---------|--------|-------|-------------------|
| images | -       | -      | array | Input image array |

## Data structure (same as from the API)
```javascript
const asObject = {
  derivative: {
    url: 'https://api.haridusportaal.twn.zone/sites/default/files/styles/crop_large/public/2019-04/4.9mb_1.jpg?itok=advang_9',
  },
  alt: 'Alt text 2',
  title: 'Title text 2',
};

const asArray = [
  {
    derivative: {
      url: 'https://api.haridusportaal.twn.zone/sites/default/files/styles/crop_large/public/2019-09/4.jpeg?itok=6nd3dmsR',
    },
    alt: 'Alt text',
    title: 'Title text',
  },
  {
    derivative: {
      url: 'https://api.haridusportaal.twn.zone/sites/default/files/styles/crop_large/public/2019-04/4.9mb_1.jpg?itok=advang_9',
    },
    alt: 'Alt text 2',
    title: 'Title text 2',
  },
];
```



