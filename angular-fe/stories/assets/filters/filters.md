# Filters

## Usage

```html
<form filters>
  <formItem name="title"></formItem>
  <formItem name="location"></formItem>
</form>
<searchResults [type]="type" limit="10"></searchResults>
```

## searchResults properties

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| type | - | news, school, studyProgramme | string | same types as ListItem

## filters usage
Just add "filters" directive to <form> and make sure every <b>&lt;formItem&gt;</b> has <b>"name"</b> attribute.
The <b>"name"</b> attribute is used to create query parameters.