import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AuthService, AlertsService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'digitalSignView',
  templateUrl: 'digitalSignView.template.html',
  styleUrls: ['digitalSignView.styles.scss'],
})

export class DigitalSignViewComponent implements OnInit {

  data = {};
  breadcrumbs: any = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Minu töölaud',
      link: '/töölaud',
    },
    {
      title: 'Andmete digitembeldamine',
    },
  ];
  keyOrder = [
    'oping',
    'tootamine',
    'kvalifikatsioonid',
    'taiendkoolitus',
  ];
  loading = false;
  currentDate: Date = new Date();

  error = false;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
    public auth: AuthService,
    private router: ActivatedRoute,
    private translate: TranslateService,
  ) { }

  fetchData() {
    this.loading = true;
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/digital_sign_data?_format=json`,
      )
      .subscribe(
        (response: any) => {
          if (response.error) {
            this.error = true;
            const currentLang = 'et';
            this.alertsService
              .info(response.error.message_text[currentLang], 'studies', 'studies', false, false);
          } else {
            const responseData = response['value'];
            Object.entries(responseData).map(([key, val]) => {
              const keyVal: any = val;
              this.data[key] = this.sortValue(key, keyVal);
            });
            this.data['kvalifikatsioon']
              .sort((a, b) => b.aasta - a.aasta)
              .map(elem => elem.typeName = 'kvalifikatsioon');
            this.data['kvalifikatsioonid'] =
              [...this.data['kvalifikatsioon'], ...this.data['tasemeharidus']];
          }
          sub.unsubscribe();
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.error = true;
          this.alertsService
            .info('errors.studies_data_missing', 'studies');
        });
  }
  sortValue(key = '', value = []) {
    switch (key) {
      case 'oping':
        return value.sort((a, b) => {
          const arrA = a.oppAlgus.split('.');
          const valA = `${arrA[2]}-${arrA[1]}-${arrA[0]}`;
          const arrB = b.oppAlgus.split('.');
          const valB = `${arrB[2]}-${arrB[1]}-${arrB[0]}`;
          return +new Date(valB) - +new Date(valA);
        });
      case 'tootamine':
        return value.sort((a, b) => {
          const obj = this.convertDates(a.ametikohtAlgus, b.ametikohtAlgus);
          return +new Date(obj.valB) - +new Date(obj.valA);
        });
      case 'taiendkoolitus':
        return value.sort((a, b) => {
          const obj = this.convertDates(a.loppKp, b.loppKp);
          return +new Date(obj.valB) - +new Date(obj.valA);
        });
      case 'tasemeharidus':
        return value.sort((a, b) => {
          const obj = this.convertDates(a.lopetanud, b.lopetanud);
          return +new Date(obj.valB) - +new Date(obj.valA);
        }).map((elem) => {
          if (elem.lopetanud) {
            elem.aastaLopetanud = elem.lopetanud.split('.')[2];
          }
          elem.typeName = 'tasemeharidus';
          return elem;
        });
      default:
        return value;
    }
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
  isDateInPast(date) {
    const dateArr = date.split('.');
    const formattedDate = `${dateArr[1]}/${dateArr[0]}/${dateArr[2]}`;
    return new Date(formattedDate).setHours(0, 0, 0, 0) < this.currentDate.setHours(0, 0, 0, 0);
  }
  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type.toLocaleLowerCase();
    }
    return translation.toLocaleLowerCase();
  }
  getSignedFile() {
    const url = `${this.settings.url}/digi-signed`;
    const body = {

    };
    this.http.post(url, body).subscribe((response) => {
      console.log(response);
    });
  }
  ngOnInit() {
    this.fetchData();
  }
}
