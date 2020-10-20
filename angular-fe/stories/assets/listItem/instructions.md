# List item

## Usage

```html
<listItem
  type="studyProgramme"
  [list]="list"
></listItem>
```

## Properties

| Name  | Required  | Values  |  Type | Description  |
|---|---|---|---|---|
| list | True | - | Object[] | List data
| type | True | school, studyProgramme, news | string | List item type

## Javascript
```javascript
const list = [
  {
    "nid": 54671,
    "entityLabel": "500-se ja suurema kogumahutavusega laeva vahit\u00fc\u00fcrimees",
    "entityUrl": {
      "path": "\/erialad\/500-se-ja-suurema-kogumahutavusega-laeva-vahit\u00fc\u00fcrimees-0"
    },
    "fieldSchoolWebsite": "http:\/\/www.merekool.ee",
    "fieldSpecialization": "m\u00e4\u00e4ramata",
    "fieldDegreeOrDiplomaAwarded": null,
    "fieldShortDescription": null,
    "fieldSchoolAddress": "Kopli tn 101, P\u00f5hja-Tallinna linnaosa, Tallinn, Harju maakond",
    "fieldEducationalInstitution": {
      "entity": {
        "entityLabel": "Eesti Merekool",
        "fieldSchoolContactEmail": "eesti.merekool@merekool.ee",
        "fieldSchoolContactPhone": "6135483",
        "entityId": "42787"
      }
    },
    "fieldTeachingLanguage": [
      {
        "entity": {
          "entityLabel": "eesti keel"
        }
      }
    ],
    "fieldStudyProgrammeType": {
      "entity": {
        "tid": 1408,
        "entityLabel": "Kutsehariduse \u00f5ppekava"
      }
    },
    "fieldDuration": 28,
    "fieldAdmissionStatus": "Avatud",
    "fieldAccreditationStatus": null,
    "fieldAccreditationValidUntil": null,
    "fieldStudyProgrammeLevel": {
      "entity": {
        "entityLabel": "Kutse\u00f5pe keskhariduse baasil"
      }
    },
    "fieldIscedfBoard": {
      "entity": {
        "entityLabel": "Teenindus"
      }
    },
    "fieldIscedfDetailed": {
      "entity": {
        "entityLabel": "Transporditeenused"
      }
    },
    "fieldIscedfNarrow": {
      "entity": {
        "entityLabel": "Transporditeenused"
      }
    }
  },
]
```