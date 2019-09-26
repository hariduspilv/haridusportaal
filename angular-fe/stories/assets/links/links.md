# Links

## Usage

```html
<links [data]="data"></button>
```

## Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| type | external | external, document | string | Links icon and behaviour

## Data structure (same as from the API)
```javascript
const external = [
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link',
  },
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link 2',
  },
  {
    url: {
      path:	'https://www.lipsum.com/feed/html',
    },
    title:	'Link 3',
  },
];

const documents = [
  {
    description: 'Kirjeldus',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
  {
    description: 'Kirjeldus 2',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
  {
    description: 'Kirjeldus 3',
    entity: {
      url: 'http://htm.wiseman.ee/sites/default/files/2019-09/Pereliikme%20D%C3%B6k%C3%BCment.pdf',
    },
  },
];
```



