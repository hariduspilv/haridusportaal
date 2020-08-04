# Block

## Simple block usage

```html
<block>
  <block-title>
    ... title
  </block-title>
  <block-content>
    ... content
  </block-content>
</block>
```

## Tabs block usage

```html
<block>
  <block-title>
    ... title
  </block-title>
  <block-content tabLabel="label text here" tabIcon="iconName">
    ... content
  </block-content>
  <block-content tabLabel="label text here" tabIcon="iconName">
    ... content
  </block-content>
</block>
```


## block properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| theme | blue | blue, yellow | string | Block top border color
| tabStyle | default | default, middle | string | Block tab positioning and style
| titleBorder | true | true, false | boolean | Visibility of titles border
| loading | false | true, false | boolean | Shows loading skeleton


## block-content properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| tabLabel | - | - | string | Just a short title for the tab
| tabIcon | - | - | string | Same icons as in assets->icons


