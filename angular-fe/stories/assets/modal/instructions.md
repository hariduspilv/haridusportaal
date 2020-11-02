# Modal

## Usage

```html
<htm-modal id="search"
  modalTitle="Otsing"
  topAction="true"
  bottomAction="false">
  <ng-template id="search">
    ... content
  </ng-template>
</htm-modal>
```

## Modal Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| id | - | - | string | Unique identifier
| modalTitle | - | - | string | Title
| titleExists | true | true, false | boolean | Title state
| topAction | true | true, false | boolean | Top action button state
| bottomAction | true | true, false | boolean | Bottom action button state
| initializeAsOpen | false | true, false | boolean | opens modal when inserted into DOM.

## Events

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| onClose | true | true | boolean | Activates on modal close
