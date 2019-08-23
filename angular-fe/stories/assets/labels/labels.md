# Labels

## Usage

```html
<labels
  [data]="data"
  background="#ffffff"
  border="#c7c7c9">
</labels>
```

## Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | Object[] | Label data
| background | #ffffff | - | string | Background color for labels
| border | - | - | string | Border color for labels

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



