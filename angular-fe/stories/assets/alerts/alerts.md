# Alerts

## Properties

### Alerts

Alerts holds all of the singular Alert components whose id's match with the Alerts list component

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| id | global | - | string | Alert list identifier
| small | false | true, false | boolean | If set to 'true' then the alert list uses smalle paddings and icons 

### Alert

Alert is one single alert entity

| Name  | Default  | Values  |  Type | Description  |
|---|---|---|---|---|
| message | - | - | string | Message to show on the alert
| type | - | Warning, Error, Success, Info | AlertType | Set which type of an alert will be shown
| id | 'global' | - | string | Set which alert block will the alert be shown in
| closeable | true | true, false | boolean | If set to 'true' then alert can be closed/removed
| httpStatus | - | - | number | If showing request errors by HTTP Status, add status code, so there are no duplicate messages

```js
enum AlertType {
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
  Error = 'error'
}
```

## Usage

```html
<alerts id="ALERTS_BLOCK_ID"></alerts>
<alerts id="ALERTS_BLOCK_ID" small="true"></alerts>
```


Inject service to component

```js
constructor(
  ...
    private alertService: AlertsService;
  ...
){}
```
Quick methods

```js
const classMethod = (arg) => {
  ...
    //quick methods
    this.alertsService.info('message'); //info to global
    this.alertsService.success('message', 'ALERTS_BLOCK_ID'); //success to ALERTS_BLOCK_ID alert list
    this.alertsService.error('message', 'ALERTS_BLOCK_ID', false); //ALERTS_BLOCK_ID, not closable
    this.alertsService.warning('message', 'ALERTS_BLOCK_ID');
  ...
}
```
For finer control

```js
const classMethod = (arg) => {
    ...
    //throw new alert from anywhere
    this.alertsService.notify(
      new Alert({
        message: 'errors.request',
        type: NotificationType.Error,
        id: 'global',
        closeable: true,
        httpStatus: 404,
      })
    );
  ...
}
```