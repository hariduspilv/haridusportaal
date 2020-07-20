# Chart

## Usage

```html
<chart
  [data]='data'
  [type]='type'>
</chart>
```

## Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | Object[] | Chart data
| type | - | 'filter', - | string | Filters or no

```javascript
const data: Object = {
  fieldDynamicGraph: [
    {
      graphSet: null,
      graphTitle: 'Kassi ja koera kaalumised',
      filterValues: '{\'graph_type\':\'line\',\'graph_options\':{\'graph_title\':\'Kassi ja koera kaalumised\',\'graph_indicator\':{\'Kaal\':\'Kaal\'},\'graph_v_axis\':\'periood\',\'graph_group_by\':{\'valdkond\':\'valdkond\'},\'graph_filters\':{\'valdkond\':{\'koer\':\'koer\',\'kass\':\'kass\'},\'alavaldkond\':[],\'ametiala\':[],\'periood\':[],\'silt\':[]},\'graph_y_min\':\'0\',\'graph_y_unit\':\'summa\',\'graph_text\':{\'value\':\'\\u003Cp\\u003EM\\u00f5nel aastal ununes kaaluda.\\u003C\\/p\\u003E\\r\\n\',\'format\':\'custom_editor\'}},\'_weight\':\'0\',\'_original_delta\':0,\'hierarchy\':null}',
      graphType: 'line',
      secondaryGraphType: null,
      graphText: '<p>Mõnel aastal ununes kaaluda.</p>\r\n'
    },
    ...
  ]
}
```
