# Info system page

## Usage

```html
<infoSystem-view
  [data]="data"
></infoSystem-view>
```

## Properties

| Name  | Required  | Values  |  Type | Description  |
|---|---|---|---|---|
| data | True | - | Object{} | List data

## Javascript
```javascript
const data = {
  "nid": 52784,
  "title": "Eesti Hariduse Infos\u00fcsteem (EHIS)",
  "fieldSubtitle": "\u00dcldandmed",
  "fieldLogo": {
    "derivative": {
      "url": "http:\/\/htm.wiseman.ee\/sites\/default\/files\/styles\/crop_large\/public\/2019-07\/ehislogo_est_0.png?itok=a9maBuvC"
    },
    "targetId": 4974,
    "alt": "Logo",
    "title": ""
  },
  "fieldIntroductionText": "Eesti Hariduse Infos\u00fcsteem (EHIS) on riiklik register, mis koondab hariduss\u00fcsteemi puudutavaid andmeid Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisis.",
  "fieldContentText": {
    "value": "\u003Cp\u003EPellentesque lobortis libero in eros cursus, eu condimentum tellus tempus. Integer eget cursus risus. Nulla venenatis urna sed odio ornare, eu fringilla mi sodales. In bibendum imperdiet pellentesque. See on \u003Ca href=\u0022www.google.com\u0022 title=\u0022sisemine link\u0022\u003Esisemine link\u003C\/a\u003E, eget molestie lectus pharetra ac. In hac habitasse platea dictumst. Sed porta ipsum purus, a porta magna venenatis in.\u003C\/p\u003E\r\n\r\n\u003Cp\u003ECras pellentesque sit amet risus non commodo. Mauris eu sem fermentum nisl rhoncus volutpat. Donec hendrerit dui non lobortis luctus. Maecenas dapibus metus non tristique interdum. Aliquam ultricies, libero at aliquam convallis, tellus arcu condimentum metus, eu gravida leo risus eget tortor. Integer laoreet diam ut varius interdum. \u003Ca href=\u0022www.priit.pary\u0022 target=\u0022_blank\u0022 title=\u0022See on v\u00e4line link siin\u0022\u003ESee on v\u00e4line link siin\u003C\/a\u003E.\u003C\/p\u003E\r\n",
    "format": "custom_editor",
    "processed": "\u003Cp\u003EPellentesque lobortis libero in eros cursus, eu condimentum tellus tempus. Integer eget cursus risus. Nulla venenatis urna sed odio ornare, eu fringilla mi sodales. In bibendum imperdiet pellentesque. See on \u003Ca href=\u0022www.google.com\u0022 title=\u0022sisemine link\u0022\u003Esisemine link\u003C\/a\u003E, eget molestie lectus pharetra ac. In hac habitasse platea dictumst. Sed porta ipsum purus, a porta magna venenatis in.\u003C\/p\u003E\n\n\u003Cp\u003ECras pellentesque sit amet risus non commodo. Mauris eu sem fermentum nisl rhoncus volutpat. Donec hendrerit dui non lobortis luctus. Maecenas dapibus metus non tristique interdum. Aliquam ultricies, libero at aliquam convallis, tellus arcu condimentum metus, eu gravida leo risus eget tortor. Integer laoreet diam ut varius interdum. \u003Ca href=\u0022www.priit.pary\u0022 target=\u0022_blank\u0022 title=\u0022See on v\u00e4line link siin\u0022\u003ESee on v\u00e4line link siin\u003C\/a\u003E.\u003C\/p\u003E"
  },
  "fieldWebpageLink": [
    {
      "url": {
        "routed": true,
        "path": "\/artiklid\/kes-k\u00e4is-kala-paljajalu"
      },
      "title": "EHISe isikustatud ja statistiliste andmete kasutamise dokument"
    },
    {
      "url": {
        "routed": false,
        "path": "http:\/\/priit.party"
      },
      "title": "Kasutajajuhend"
    }
  ],
  "fieldFile": [
    {
      "entity": {
        "fieldAttachment": {
          "description": "",
          "entity": {
            "entityLabel": "Tulemuste_import_1 (1)_0.xlsx",
            "entityType": "file",
            "entityChanged": "2019-07-01T14:54:46+0300",
            "entityBundle": "file",
            "entityCreated": "2019-07-01T14:50:09+0300",
            "url": "http:\/\/htm.wiseman.ee\/sites\/default\/files\/2019-07\/Tulemuste_import_1%20%281%29_0.xlsx",
            "filename": "Tulemuste_import_1 (1)_0.xlsx",
            "filemime": "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        },
        "fieldName": "Tulemuste import TEST!"
      }
    }
  ],
  "fieldInfosystemAccordion": {
    "entity": {
      "fieldAccordionTitle": "Juhendid",
      "fieldAttachmentFile": [
        {
          "entity": {
            "fieldAttachment": {
              "description": "",
              "entity": {
                "entityLabel": "Tulemuste_import_1 (1)_2.xlsx",
                "entityType": "file",
                "entityChanged": "2019-07-01T14:54:46+0300",
                "entityBundle": "file",
                "entityCreated": "2019-07-01T14:53:14+0300",
                "url": "http:\/\/htm.wiseman.ee\/sites\/default\/files\/2019-07\/Tulemuste_import_1%20%281%29_2.xlsx",
                "filename": "Tulemuste_import_1 (1)_2.xlsx",
                "filemime": "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              }
            },
            "fieldName": "Juhendid lehe fail (mitte akordionis)"
          }
        }
      ],
      "fieldLinks": [
        {
          "url": {
            "routed": false,
            "path": "http:\/\/www.google.com"
          },
          "title": "Juhendid lehe link"
        },
        {
          "url": {
            "routed": false,
            "path": "http:\/\/priit.party"
          },
          "title": "Juhendid lehe link 2"
        }
      ],
      "fieldBody": {
        "value": "\u003Cp\u003EPellentesque lobortis libero in eros cursus, eu condimentum tellus tempus. Integer eget cursus risus. Nulla venenatis urna sed odio ornare, eu fringilla mi sodales. In bibendum imperdiet pellentesque. See on \u003Ca href=\u0022www.google.com\u0022 title=\u0022sisemine link\u0022\u003Esisemine link\u003C\/a\u003E, eget molestie lectus pharetra ac. In hac habitasse platea dictumst. Sed porta ipsum purus, a porta magna venenatis in.\u003C\/p\u003E\r\n\r\n\u003Cp\u003ECras pellentesque sit amet risus non commodo. Mauris eu sem fermentum nisl rhoncus volutpat. Donec hendrerit dui non lobortis luctus. Maecenas dapibus metus non tristique interdum. Aliquam ultricies, libero at aliquam convallis, tellus arcu condimentum metus, eu gravida leo risus eget tortor. Integer laoreet diam ut varius interdum. \u003Ca href=\u0022www.priit.pary\u0022 target=\u0022_blank\u0022 title=\u0022See on v\u00e4line link siin\u0022\u003ESee on v\u00e4line link siin\u003C\/a\u003E.\u003C\/p\u003E\r\n",
        "format": "custom_editor",
        "processed": "\u003Cp\u003EPellentesque lobortis libero in eros cursus, eu condimentum tellus tempus. Integer eget cursus risus. Nulla venenatis urna sed odio ornare, eu fringilla mi sodales. In bibendum imperdiet pellentesque. See on \u003Ca href=\u0022www.google.com\u0022 title=\u0022sisemine link\u0022\u003Esisemine link\u003C\/a\u003E, eget molestie lectus pharetra ac. In hac habitasse platea dictumst. Sed porta ipsum purus, a porta magna venenatis in.\u003C\/p\u003E\n\n\u003Cp\u003ECras pellentesque sit amet risus non commodo. Mauris eu sem fermentum nisl rhoncus volutpat. Donec hendrerit dui non lobortis luctus. Maecenas dapibus metus non tristique interdum. Aliquam ultricies, libero at aliquam convallis, tellus arcu condimentum metus, eu gravida leo risus eget tortor. Integer laoreet diam ut varius interdum. \u003Ca href=\u0022www.priit.pary\u0022 target=\u0022_blank\u0022 title=\u0022See on v\u00e4line link siin\u0022\u003ESee on v\u00e4line link siin\u003C\/a\u003E.\u003C\/p\u003E"
      },
      "fieldLowerParagraph": [
        {
          "entity": {
            "fieldParagraphTitle": "Alusharidus",
            "fieldParagraphAttachment": [
              {
                "entity": {
                  "fieldAttachment": {
                    "description": "",
                    "entity": {
                      "entityLabel": "Tulemuste_import_1 (1)_1.xlsx",
                      "entityType": "file",
                      "entityChanged": "2019-07-01T14:54:46+0300",
                      "entityBundle": "file",
                      "entityCreated": "2019-07-01T14:52:40+0300",
                      "url": "http:\/\/htm.wiseman.ee\/sites\/default\/files\/2019-07\/Tulemuste_import_1%20%281%29_1.xlsx",
                      "filename": "Tulemuste_import_1 (1)_1.xlsx",
                      "filemime": "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                  },
                  "fieldName": "Akordionis fail WUHOO!?"
                }
              }
            ],
            "fieldParagraphLink": [
              {
                "url": {
                  "routed": false,
                  "path": "http:\/\/priit.party"
                },
                "title": "kolmas kord kui priidu CV pildil on?"
              },
              {
                "url": {
                  "routed": true,
                  "path": "\/s\u00fcndmused\/s\u00fcndmuse-tag1-est-test-ei-edasta-seda"
                },
                "title": "Test link"
              }
            ],
            "fieldParagraphContent": {
              "value": "\u003Cp\u003EV\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst e\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele.\u003C\/p\u003E\r\n\r\n\u003Cp\u003E\u003Cstrong\u003EV\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst\u0026nbsp; V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele.\u003C\/strong\u003E\u003C\/p\u003E\r\n\r\n\u003Cp\u003EV\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst\u0026nbsp; V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele\u0026nbsp;V\u00e4ike sisutekst juhenditele.\u003C\/p\u003E\r\n",
              "format": "custom_editor",
              "processed": "\u003Cp\u003EV\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst e\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele.\u003C\/p\u003E\n\n\u003Cp\u003E\u003Cstrong\u003EV\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst\u00a0 V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele.\u003C\/strong\u003E\u003C\/p\u003E\n\n\u003Cp\u003EV\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst\u00a0 V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele\u00a0V\u00e4ike sisutekst juhenditele.\u003C\/p\u003E"
            }
          }
        },
        {
          "entity": {
            "fieldParagraphTitle": "Pedagoogid",
            "fieldParagraphAttachment": [

            ],
            "fieldParagraphLink": [
              {
                "url": {
                  "routed": false,
                  "path": "https:\/\/lego.com"
                },
                "title": "Cool link"
              }
            ],
            "fieldParagraphContent": null
          }
        }
      ]
    }
  },
  "fieldInfosystemSidebar": {
    "entity": {
      "fieldLegislationBlock": [
        {
          "url": {
            "routed": false,
            "path": "http:\/\/www.google.com"
          },
          "title": "Eesti Hariduse Infos\u00fcsteemi p\u00f5him\u00e4\u00e4rus"
        },
        {
          "url": {
            "routed": false,
            "path": "http:\/\/priit.party"
          },
          "title": "Eesti Hariduse Infos\u00fcsteemi p\u00f5him\u00e4\u00e4rus"
        },
        {
          "url": {
            "routed": false,
            "path": "http:\/\/priit.party"
          },
          "title": "Eesti Hariduse Infos\u00fcsteemi p\u00f5him\u00e4\u00e4rus"
        }
      ],
      "fieldBlocks": [
        {
          "entity": {
            "fieldBlockTitle": "Leia kiiresti",
            "fieldBlockLinks": [
              {
                "entity": {
                  "fieldWebpageLink": {
                    "url": {
                      "routed": false,
                      "path": "http:\/\/google.com"
                    }
                  },
                  "fieldLinkName": "testime linki"
                }
              }
            ]
          }
        }
      ],
      "fieldButton": [
        {
          "url": {
            "routed": false,
            "path": "http:\/\/www.google.com"
          },
          "title": "EHIS avalik vaade"
        },
        {
          "url": {
            "routed": false,
            "path": "http:\/\/www.priit.party"
          },
          "title": "Sisene EHIS-sse"
        }
      ]
    }
  }
}
```