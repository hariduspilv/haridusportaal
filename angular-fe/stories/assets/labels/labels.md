# Labels

## Usage

```html
<labels
  [data]="data"
  type="plain">
</labels>
  <!-- background="#ffffff" -->
  <!-- border="#c7c7c9" -->
```

## Properties

NB! Type property overrides background and border.

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | Object[] | Label data
| type | none | none, orange, plain | string | Label type
| background | #ffffff | - | string | Background color for labels (storybook)
| border | - | - | string | Border color for labels (storybook)

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



