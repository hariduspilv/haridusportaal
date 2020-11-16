# Labels

## Usage

```html
<labels
  [data]="data"
  type="plain">
</labels>
```

## Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | Object[] | Label data
| type | none | none, plain, orange | string | Label type

## Javascript
```javascript
const data = [
  {
    entity: {
      entityLabel: 'kala',
      tid: 2445,
    },
  },
  {
    entity: {
      entityLabel: 'kaos',
      tid: 2441,
    },
  },
]
// Without extra object
const data = [
  {
    value: 'kala',
  },
]
```



