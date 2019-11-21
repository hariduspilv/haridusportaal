import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { AlertsService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RootScopeService } from '@app/_services/RootScopeService';
import { SettingsService } from '@app/_services/SettingsService';

@Component({
  selector: 'teachings',
  templateUrl: './teachings.template.html',
  styleUrls: ['./teachings.styles.scss'],
})

export class TeachingsComponent implements OnInit {
  @Input() jwt;

  content: any = false;
  openAccordion: any = false;
  loading: boolean = true;
  error: boolean = false;
  dataErr: boolean = false;
  requestErr: boolean = false;
  headers: HttpHeaders;
  public currentDate: Date = new Date();
  contentTypes = ['tootamine', 'kvalifikatsioonid', 'taiendkoolitus'];
  routeType = {
    tootamine: 'töötamine',
    kvalifikatsioonid: 'kvalifikatsioonid',
    taiendkoolitus: 'täiendkoolitus',
  };
  accordionStates: Boolean[] = [false, false, false, false];

  constructor(
    private http: HttpClient,

    private router: Router,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private settings: SettingsService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    const sub =
      this.http
        .get(
          `${this.settings.url}/dashboard/eeIsikukaart/teachings?_format=json`,
          { headers: this.headers })
        .subscribe(
          (response: any) => {
            if (response['error']) {
              this.error = true;
              this.requestErr = true;
              const currentLang = 'et';
              this.alertsService
                .info(
                  response.error.message_text[currentLang],
                  'general',
                  'teachings',
                  false,
                  false,
                );
            } else {
              try {
                this.content = response['value'];
                let errorVal = true;
                Object.values(this.content).forEach((elem) => {
                  if (elem[0]) { errorVal = false; }
                });
                this.error = this.dataErr = errorVal;
                if (this.content) {

                  try {
                    this.content.tootamine.sort((a, b) => {
                      const obj = this.convertDates(a.ametikohtAlgus, b.ametikohtAlgus);
                      return +new Date(obj.valB) - +new Date(obj.valA);
                    });
                  } catch (err) { }

                  try {
                    this.content.taiendkoolitus.sort((a, b) => {
                      const obj = this.convertDates(a.loppKp, b.loppKp);
                      return +new Date(obj.valB) - +new Date(obj.valA);
                    });
                  } catch (err) { }

                  try {
                    this.content.tasemeharidus.sort((a, b) => {
                      const obj = this.convertDates(a.lopetanud, b.lopetanud);
                      return +new Date(obj.valB) - +new Date(obj.valA);
                    }).map((elem) => {
                      if (elem.lopetanud) {
                        elem.aastaLopetanud = elem.lopetanud.split('.')[2];
                      }
                      elem.typeName = 'tasemeharidus';
                      return elem;
                    });
                  } catch (err) {
                    console.log(err);
                  }
                  this.content.kvalifikatsioon
                    .sort((a, b) => b.aasta - a.aasta)
                    .map(elem => elem.typeName = 'kvalifikatsioon');
                  this.content.kvalifikatsioonid =
                    [...this.content.kvalifikatsioon, ...this.content.tasemeharidus];
                }
                if (errorVal) {
                  throw new Error();
                }
              } catch (err) {
                this.alertsService
                  .info('errors.teachings_data_missing', 'general', 'teachings', false, false);
              }
            }
            sub.unsubscribe();
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            this.error = true;
            this.requestErr = true;
            this.alertsService
              .info('errors.teachings_data_request', 'general', 'teachings', false, false);
          });
  }

  convertDates(dateA, dateB) {
    let valA = null;
    let valB = null;
    if (dateA) {
      const arrA = dateA.split('.');
      valA = `${arrA[2]}-${arrA[1]}-${arrA[0]}`;
    }
    if (dateB) {
      const arrB = dateB.split('.');
      valB = `${arrB[2]}-${arrB[1]}-${arrB[0]}`;
    }
    return { valA, valB };
  }

  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type;
    }
    return translation;
  }

  isDateInPast(date) {
    const dateArr = date.split('.');
    const formattedDate = `${dateArr[1]}/${dateArr[0]}/${dateArr[2]}`;
    return new Date(formattedDate).setHours(0, 0, 0, 0) < this.currentDate.setHours(0, 0, 0, 0);
  }

  ngOnDestroy() {
    // this.rootScope.set('teachingsAccordion', this.accordionStates);
  }
}
