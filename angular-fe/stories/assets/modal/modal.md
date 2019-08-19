# Modal

## Usage

```html
<htm-modal id="modal-1" title="Tiitel" titleExists="true"
  topAction="true" bottomAction="true">
  <modal-content id="modal-1" loading="true">
    ... content
  </modal-content>
</htm-modal>
```

## Modal Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| id | - | - | string | Unique identifier
| title | - | - | string | Title
| titleExists | true | true, false | boolean | Title state
| topAction | true | true, false | boolean | Top action button state
| bottomAction | true | true, false | boolean | Bottom action button state

## Modal Content properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| id | - | - | string | Parent identifier
| loading | false | true, false | boolean | Loading state