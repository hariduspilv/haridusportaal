# Sidebar

## Usage

```html
<sidebar [data]='data'></sidebar>
```

## Sidebar properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | object | Request data

```javascript
const data = {
  favourites: [
    {
      entity: {
        entityAccess: false,
        entityLabel: 'Artikkel mugudest',
        entityUrl: { path: '/artiklid/artikkel-mugudest' },
      },
      targetId: 48788,
    },
  ],
  fieldNeutral: [
    'Neurtaalne 1',
  ],
  fieldCons: [
    'Miinus 1',
  ],
  fieldJobOpportunities: [
    {
      url: {
        path: '/uudised',
        routed: true,
      },
      title: 'Lingi tekst',
    }
  ],
  reverseOskaMainProfessionOskaFillingBarEntity: {
    entities: [
      {
        value: '4',
      }
    ]
  },
}
```


