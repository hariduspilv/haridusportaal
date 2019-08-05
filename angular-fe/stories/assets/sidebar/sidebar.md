# Sidebar

## Usage

```html
<sidebar [data]="data"></sidebar>
```
<!-- [facts]="facts" -->
<!-- | facts | - | - | string | Indicator request data -->

## Sidebar properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | - | - | object | Request data

```javascript
const data = {
  "fieldNeutral": [
    "Neurtaalne 1"
  ],
  "fieldCons": [
    "Miinus 1",
    "Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Majandusministeeriumis ekspeks"
  ],
  "fieldJobOpportunities": [
    {
      "url": {
        "path": "/uudised",
        "routed": true
      },
      "title": "Lingi tekst"
    }
  ],
}
```


