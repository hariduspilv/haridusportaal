import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';
import { TableService } from '@app/_services';
import { UserService } from '@app/_services/userService';

const ACCEPTABLE_FORMS_RESTRICTED_LENGTH = 4;
const REQUEST_ITERATOR_LIFETIME = 30;

@Component({
  selector: 'applications',
  templateUrl: './applications.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})

export class ApplicationsComponent implements OnInit, OnDestroy{
  public loading = {
    initial: false,
    interval: false
  };
  public dummyDataVersion: string; //Delete this row after testing is done
  public startTime;
  public endViewCheck: boolean = false;
  public acceptableFormsLimiter = ACCEPTABLE_FORMS_RESTRICTED_LENGTH;
  public lang: string;
  public pollingLoader: boolean = true;
  public data = {
    message: null,
    acceptable_forms: [],
    documents: [],
    drafts: [],
    educationalInstitutions: []
  };
  public request_iterator;
  public request_iterator_timeout = 2000;
  public userData: any;
  public currentRole: string = '';

  public acceptable_forms_list = [];
  public acceptable_forms_list_restricted: boolean = true;
  public tableOverflown: any = [{0: false, 1: false}];
  public elemAtStart: any = [{0: true, 1: true}];
  public initialized: any = [{0: false, 1: false}];
  private subscriptions: Subscription[] = [];


  constructor(public http: HttpService,
    public rootScope: RootScopeService,
    public route: ActivatedRoute,
    public tableService: TableService,
    public user: UserService) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/dashboard/applications',
      'et': '/et/toolaud/taotlused'
    });
  }

  pathWatcher() { 
    let params = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );
    let queryParams = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        if(strings['version'] != undefined) {
          this.dummyDataVersion = strings['version'];
        } else {
          this.dummyDataVersion = '1';
        }
      }
    );

    this.subscriptions = [...this.subscriptions, queryParams];

    this.subscriptions = [...this.subscriptions, params];
  }

  selectLanguage(obj: object){
    if(obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }

  compileXjsonLink(form_name){
    if(!form_name) return "";
    return form_name
  }

  sortList(list, method){
    const ACCEPTED = ['title', 'date'];
    if(!list.length || !ACCEPTED.includes(method)) return list;

    let self = this;
    function compareTitle(a,b) {
      if(!a['title'] || !b['title']) return -1;
      let title1 = self.selectLanguage(a['title']).toUpperCase();
      let title2 = self.selectLanguage(b['title']).toUpperCase();
      if (title1 < title2)
        return -1;
      if (title1 > title2)
        return 1;
      return 0;
    }

    let regex = /(\d{2}).(\d{2}).(\d{4})/;
    function compareDate(a,b){
      if(!a['document_date'] || !b['document_date']) return -1;
      return Number(new Date(b.document_date.replace( regex , "$3/$2/$1" ))) - Number(new Date(a.document_date.replace( regex, "$3/$2/$1")));
    }

    if(method === 'title') return list.sort(compareTitle);
    else return list.sort(compareDate);
  }

  formatAcceptableForms(list){
    if(this.acceptable_forms_list_restricted === true){
      return  JSON.parse(JSON.stringify(list)).splice(0, ACCEPTABLE_FORMS_RESTRICTED_LENGTH);
    } else {
     return JSON.parse(JSON.stringify(list));
    }
  }
  
  toggleAcceptableFormsList(){
    this.acceptable_forms_list_restricted = this.acceptable_forms_list_restricted === true ? false : true;
    this.acceptable_forms_list = this.formatAcceptableForms(this.data.acceptable_forms);
  }

  fetchData(){
    let request_boolean = this.loading['initial'] === true ? 1 : 0;
   
    let subscription = this.http.get('/dashboard/applications/'+ request_boolean +'?_format=json').subscribe(response => {
      
      /* DUMMY DATA */
      let juridicalDummyData = {
        "1": {
          "message": "Siin on mingi info teavitus, võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk",
          "ownerid":"80044738",
          "educationalInstitutions":[  
            {  
              "id":1039,
              "message":"Aruanne esitamata!",
              "documents":[  
                  {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "id":223489,
                    "document_date":"27.03.2017",
                    "status":"Esitatud",
                    "description":"T\u00e4iskasvanuhariduse majandustegevusteade number 177137 kehtivusega alates 27.03.2017 kuni null",
                    "title":{  
                        "et":"Puudub",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "id":223489,
                    "document_date":"29.09.2018",
                    "status":"Esitatud",
                    "description":"T\u00e4iskasvanuhariduse majandustegevusteade number 177137 kehtivusega alates 27.03.2017 kuni null",
                    "title":{  
                        "et":"Puudub",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA",
                    "id":191361,
                    "document_date":null,
                    "status":"Sisestamisel",
                    "description":"Eesti keele tasemeeksami koolituse tegevusluba number null kehtivusega alates null kuni null",
                    "title":{  
                        "et":"Puudub",
                        "en":"Not Found"
                    }
                  }
              ],
              "drafts":[  
                  {  
                    "form_name":"MTSYS_TEGEVUSNAITAJAD",
                    "id":1,
                    "description":2016,
                    "document_date": "17.09.2016",
                    "title":{  
                        "et":"SIIA NIMI YO",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSNAITAJAD",
                    "id":1,
                    "description":2016,
                    "document_date": "20.09.2016",
                    "title":{  
                        "et":"Nimi",
                        "en":"Not Found"
                    }
                  }
              ],
              "acceptable_forms":[  
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"231",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"Tiitel",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"Yolo",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "title":{  
                        "et":"abc",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSNAITAJAD",
                    "description": "`2017 Kirjeldus`",
                    "title":{  
                        "et":"Nimi",
                        "en":"Not Found"
                    }
                  }
              ],
              "institutionInfo":{  
                  "generalData":{  
                    "owner":"Harku vald, Tabasalu alevik, Kase tn 4 korteri\u00fchistu (80044738)",
                    "name":"Test-huvialakool",
                    "nameENG":null,
                    "ownerType":12411,
                    "ownershipType":12418,
                    "studyInstitutionType":14487,
                    "ownerTypeType":{  
                        "et":"\u00e4ri\u00fching",
                        "valid":true
                    },
                    "ownershipTypeType":{  
                        "et":"eraomand",
                        "valid":true
                    },
                    "studyInstitutionTypeType":{  
                        "et":"Puudub",
                        "valid":false
                    }
                  },
                  "address":{  
                    "seqNo":0,
                    "adsId":2782761,
                    "adsOid":"ER01366222",
                    "klElukoht":18656,
                    "county":"Ida-Viru maakond",
                    "localGovernment":"Kohtla-J\u00e4rve linn (Ida-Viru maakond)",
                    "settlementUnit":"Ahtme linnaosa (Kohtla-J\u00e4rve linn)",
                    "address":"Altserva t\u00e4nav, 44-5",
                    "addressFull":null,
                    "addressHumanReadable":"Altserva t\u00e4nav, 44-5"
                  },
                  "contacts":{  
                    "contactPhone":"234",
                    "contactEmail":null,
                    "webpageAddress":"http:\/\/worst.ost"
                  }
              }
            },
            {  
              "id":38842,
              "message":null,
              "documents":[],
              "drafts":[],
              "acceptable_forms":[  
                 {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                       "et":"Puudub",
                       "en":"Not Found"
                    }
                 },
                 {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "title":{  
                       "et":"Puudub",
                       "en":"Not Found"
                    }
                 }
              ],
              "institutionInfo":{  
                 "generalData":{  
                    "owner":"Advokaadib\u00fcroo SORAINEN AS (10876331)",
                    "name":"O\u00dc Autos\u00f5it CUSTOM",
                    "nameENG":"eng nimi",
                    "ownerType":12411,
                    "ownershipType":12418,
                    "studyInstitutionType":15666,
                    "ownerTypeType":{  
                       "et":"\u00e4ri\u00fching",
                       "valid":true
                    },
                    "ownershipTypeType":{  
                       "et":"eraomand",
                       "valid":true
                    },
                    "studyInstitutionTypeType":{  
                       "et":"t\u00e4ienduskoolitusasutus",
                       "valid":true
                    }
                 },
                 "address":{  
                    "seqNo":0,
                    "adsId":3032805,
                    "adsOid":"CU01873875",
                    "klElukoht":22129,
                    "county":"Tartu maakond",
                    "localGovernment":"Tartu linn (Tartu maakond)",
                    "settlementUnit":"Tartu linn (Tartu linn)",
                    "address":"null",
                    "addressFull":null,
                    "addressHumanReadable":"null"
                 },
                 "contacts":{  
                    "contactPhone":null,
                    "contactEmail":"email@gmail.com",
                    "webpageAddress":null
                 }
              }
            }
          ]
        },        
        "2": {
          "message": null,
          "ownerid":"80044738",
          "educationalInstitutions":[  
            {  
              "id":38842,
              "message": "Tekst siiiiia",
              "documents":[],
              "drafts":[],
              "acceptable_forms":[],
              "institutionInfo":{  
                 "generalData":{  
                    "owner":"Advokaadib\u00fcroo SORAINEN AS (10876331)",
                    "name":"O\u00dc Autos\u00f5it CUSTOM",
                    "nameENG":"eng nimi"
                 },
                 "address":{  
                    "seqNo":0,
                    "adsId":3032805,
                    "adsOid":"CU01873875",
                    "klElukoht":22129,
                    "county":"Tartu maakond",
                    "localGovernment":"Tartu linn (Tartu maakond)",
                    "settlementUnit":"Tartu linn (Tartu linn)",
                    "address":null,
                    "addressFull":null,
                    "addressHumanReadable":"null"
                 },
                 "contacts":{  
                    "contactPhone":"51515151"
                 }
              }
            }
          ]
        },
        "3": {
          "message": "Siin on mingi info teavitus, võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk võib olla pikk",
          "ownerid":"80044738",
          "educationalInstitutions":[  
            {  
              "id":1039,
              "message":"Aruanne esitamata!",
              "documents":[  
                  {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "id":223489,
                    "document_date":"27.03.2017",
                    "status":"Esitatud",
                    "description":"T\u00e4iskasvanuhariduse majandustegevusteade number 177137 kehtivusega alates 27.03.2017 kuni null",
                    "title":{  
                        "et":"Puudub",
                        "en":"Not Found"
                    }
                  }
              ],
              "drafts":[  
                  {  
                    "form_name":"MTSYS_TEGEVUSNAITAJAD",
                    "id":1,
                    "description":2016,
                    "document_date": "17.09.2016",
                    "title":{  
                        "et":"SIIA NIMI YO",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSNAITAJAD",
                    "id":1,
                    "description":2016,
                    "document_date": "20.09.2016",
                    "title":{  
                        "et":"Nimi",
                        "en":"Not Found"
                    }
                  }
              ],
              "acceptable_forms":[  
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"231",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"Tiitel",
                        "en":"Not Found"
                    }
                  },
                  {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                        "et":"Yolo",
                        "en":"Not Found"
                    }
                  }
              ],
              "institutionInfo":{  
                  "generalData":{  
                    "owner":"Harku vald, Tabasalu alevik, Kase tn 4 korteri\u00fchistu (80044738)",
                    "name":"Test mõõdukalt andmeid",
                    "nameENG":"Test nameENG",
                    "ownerType":12411,
                    "ownershipType":12418,
                    "studyInstitutionType":14487,
                    "ownerTypeType":{  
                        "et":"\u00e4ri\u00fching",
                        "valid":true
                    },
                    "studyInstitutionTypeType":{  
                        "et":"Puudub",
                        "valid":false
                    }
                  },
                  "address":{  
                    "seqNo":0,
                    "adsId":2782761,
                    "adsOid":"ER01366222",
                    "klElukoht":18656,
                    "county":"Ida-Viru maakond",
                    "localGovernment":"Kohtla-J\u00e4rve linn (Ida-Viru maakond)",
                    "settlementUnit":"Ahtme linnaosa (Kohtla-J\u00e4rve linn)",
                    "address":"Altserva t\u00e4nav, 44-5",
                    "addressFull":null,
                    "addressHumanReadable":"Kuperjanovi 7, 76902, Harku, Harjumaa"
                  },
                  "contacts":{  
                    "contactPhone":"234",
                    "contactEmail":null,
                    "webpageAddress":"http://www.kurekrooksujaan.ee"
                  }
              }
            },
            {  
              "id":38842,
              "message":null,
              "documents":[],
              "drafts":[],
              "acceptable_forms":[  
                 {  
                    "form_name":"MTSYS_TEGEVUSLUBA_TAOTLUS",
                    "title":{  
                       "et":"Puudub",
                       "en":"Not Found"
                    }
                 },
                 {  
                    "form_name":"MTSYS_MAJANDUSTEGEVUSE_TEADE",
                    "title":{  
                       "et":"Puudub",
                       "en":"Not Found"
                    }
                 }
              ],
              "institutionInfo":{  
                 "generalData":{  
                    "owner":"Advokaadib\u00fcroo SORAINEN AS (10876331)",
                    "name": "HoHo",
                    "nameENG":"HoToTheHo",
                    "ownerType":12411,
                    "ownershipType":null,
                    "studyInstitutionType":15666,
                    "ownerTypeType":{  
                       "et":"\u00e4ri\u00fching",
                       "valid":true
                    },
                    "ownershipTypeType":{  
                       "et":"eraomand",
                       "valid":true
                    },
                    "studyInstitutionTypeType":{  
                       "et":"t\u00e4ienduskoolitusasutus",
                       "valid":true
                    }
                 },
                 "address":{  
                    "seqNo":0,
                    "adsId":3032805,
                    "adsOid":"CU01873875",
                    "klElukoht":22129,
                    "county":"Tartu maakond",
                    "localGovernment":"Tartu linn (Tartu maakond)",
                    "settlementUnit":"Tartu linn (Tartu linn)",
                    "address":"null",
                    "addressFull":null,
                    "addressHumanReadable":"null"
                 },
                 "contacts":{  
                    "contactPhone":"51515151",
                    "contactEmail":"email@gmail.com",
                    "webpageAddress":"http://www.weeb.ee"
                 }
              }
            }
          ]
        }          
      }
      let dummyData = {
        "1": {
          acceptable_forms: [
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            }
          ],
          drafts: [],
          documents: [
            {
              "form_name": "VPT_ESITATUD_TAOTLUS",
              "identifier": 157721,
              "document_date": "11.10.2018",
              "status": "Menetluses",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157722,
              "document_date": "11.10.2018",
              "status": "Tagasi lükatud",
              "description": "Wololololooooo Wololololooooo Wololololooooo",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157707,
              "document_date": "17.09.2018",
              "status": "Heaks kiidetud",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            }
          ]
        },
        "2": {
          acceptable_forms: [
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Õpetaja jätkutoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "Vajaduspõhise õppetoetuse taotlus"
              }
            }
          ],
          drafts: [{
            "form_name": "Õpetaja jätkutoetuse taotlus",
            "identifier": 157707,
            "document_date": "17.09.2016",
            "status": "Heaks kiidetud",
            "title": {
              "et": "2Vajaduspühise õppetoetuse taotlus ja otsus"
            }
          },
          {
            "form_name": "Vajaduspõhise õppetoetuse taotlus",
            "identifier": 157707,
            "document_date": "17.09.2021",
            "status": "Heaks kiidetud",
            "title": {
              "et": "2Vajaduspühise õppetoetuse taotlus ja otsus"
            }
          }],
          documents: [
            {
              "form_name": "VPT_ESITATUD_TAOTLUS",
              "identifier": 157721,
              "document_date": "28.01.2016",
              "status": "Menetluses",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157722,
              "document_date": "01.01.2018",
              "description": "Kuulilennuteetunneliluuk ja jalaseen, Kuulilennuteetunneliluuk ja jalaseen Kuulilennuteetunneliluuk ja jalaseen, Kuulilennuteetunneliluuk ja jalaseen Kuulilennuteetunneliluuk ja jalaseen, Kuulilennuteetunneliluuk ja jalaseen",
              "status": "Tagasi lükatud",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157707,
              "document_date": "12.12.2021",
              "status": "Heaks kiidetud",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            }
          ]
        }
      }
      if(this.loading.initial === true) {
        if (this.currentRole === 'natural_person') {
          this.data.acceptable_forms = dummyData[this.dummyDataVersion].acceptable_forms || response['acceptable_forms'];
          this.data.drafts = dummyData[this.dummyDataVersion].drafts || response['drafts'];
          this.data.documents = dummyData[this.dummyDataVersion].documents || response['documents'];
        } else {
          // this.data.educationalInstitutions = response['educationalInstitutions'] && response['educationalInstitutions'].length
          //   ? response['educationalInstitutions'] : juridicalDummyData[this.dummyDataVersion].educationalInstitutions;
          // this.data.message = response['message'] || juridicalDummyData[this.dummyDataVersion].message;
          this.data.educationalInstitutions = juridicalDummyData[this.dummyDataVersion].educationalInstitutions;
          this.data.message = juridicalDummyData[this.dummyDataVersion].message || response['message'];
          this.data.educationalInstitutions.forEach((elem, index) => {
            this.tableOverflown[index] = {0: false, 1: false, 2: false};
            this.elemAtStart[index] = {0: true, 1: true, 2: true};
            this.initialized[index] = {0: false, 1: false, 2: false};
          })
        }
        this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
        this.data.drafts = this.sortList(this.data.drafts, 'title');
        this.data.documents = this.sortList(this.data.documents, 'date');
        
        this.acceptable_forms_list = this.formatAcceptableForms(this.data.acceptable_forms);
      }
      /* END OF DUMMY DATA */
      
      if(this.loading.initial === true) this.loading.initial = false;
      subscription.unsubscribe();

      if((Date.now() - this.startTime)/1000 < REQUEST_ITERATOR_LIFETIME ){
        this.request_iterator_timeout += (0.25 * this.request_iterator_timeout);
        this.loading['interval'] = true;
        let self = this;
        this.request_iterator = setTimeout(() => {
          self.fetchData();
        }, this.request_iterator_timeout);
      } else {
        this.loading['interval'] = false;
      }
     
    });
  }

  initialTableCheck(id, parentIndex, index) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown[parentIndex][index] = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized[parentIndex][index] = true;
    }
  }

  institutionInfoFieldSum(school) {
    let counter = 0;
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.contactEmail) counter++;
    if (school.institutionInfo.contacts &&school.institutionInfo.contacts.contactPhone) counter++;
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.webpageAddress) counter++; 
    if (school.institutionInfo.address && school.institutionInfo.address.addressHumanReadable) counter++;
    return counter;
  }

  ngOnInit(){
    this.userData = this.user.getData();
    this.currentRole = this.userData['role']['current_role']['type'];
    this.setPaths();
    this.pathWatcher();
    this.startTime = Date.now();
    this.loading['initial'] = true;
    this.fetchData();
  }
  
  ngAfterViewChecked() {
    if (!this.endViewCheck) {
      this.initialTableCheck('table_0', 0, 0);
      this.initialTableCheck('table_1', 0, 1);
      this.data.educationalInstitutions.forEach((elem, index) => {
        this.initialTableCheck('juridicalFirst_'+index, index, 0);
        this.initialTableCheck('juridicalSecond_'+index, index, 1);
        this.initialTableCheck('juridicalThird_'+index, index, 2);
      });
      if (document.getElementById('juridicalThird_'+(this.data.educationalInstitutions.length - 1))) {
        this.endViewCheck = true;
      }
    }
  }

  ngOnDestroy(){
    if(this.request_iterator){
      clearTimeout(this.request_iterator);
    }
    
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  
}
