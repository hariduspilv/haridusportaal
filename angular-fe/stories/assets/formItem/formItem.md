# Form item

## Input: text
```html
<formItem
  type="text"
  placeholder="Start typing"
  [(ngModel)]="modelName"
  title="First name"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [disabled]="boolean"
></formItem>
```

## Input: date
```html
<formItem
  type="date"
  placeholder="pp.kk.aaaa"
  title="Select date"
  [(ngModel)]="modelName"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [disabled]="boolean"
></formItem>
```

## Select - multi
```html
<formItem
  type="multi-select"
  title="Pick multiple options"
  [(ngModel)]="modelName"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [options]="array"
  [disabled]="boolean"
></formItem>
```

## Select - single
```html
<formItem
  type="select"
  title="Pick an option"
  [(ngModel)]="modelName"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [options]="array"
  [disabled]="boolean"
></formItem>
```

## Checkbox
```html
<formItem
  type="checkbox"
  [label]="string"
  [(ngModel)]="modelName"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [disabled]="boolean"
></formItem>
```

## Radiobutton
```html
<formItem
  type="radio"
  [(ngModel)]="modelName"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [options]="array"
  [disabled]="boolean"
></formItem>
```

## Textarea
```html
<formItem
  type="textarea"
  placeholder="Start typing"
  [(ngModel)]="modelName"
  title="Nice title"
  [error]="boolean"
  [errorMessage]="string"
  [success]="boolean"
  [disabled]="boolean"
></formItem>
```

## Properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| type | text | text, select, multi-select, textarea, checkbox, radio | string | Choose the type of the form item
| placeholder | - | - | String | Placeholder text which describes the format of current form item
| title | - | - | string | Title of the form item
| options | - | - | Array<object> | Array of options [{ key: 'Option title', value: 'Option value' }]. Used for: <b>Multi-select, Select, Radio</b>
| label | - | - | string | ONLY for checkbox. Used as checkbox label text
| value | - | – | string | Form item default value
| height | - | - | number | Textarea optional height
| disabled | false | true,false | boolean | Wheter the form item is disabled or not
| error | false | true, false | boolean | Form items error theme
| errorMessage | - | - | string | Error message for 'error' theme
| success | false | true, false | boolean | Form items success theme