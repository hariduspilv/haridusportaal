import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AuthService, AlertsService, NgbDateCustomParserFormatter } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { DSVResponse, DSVValue } from './digitalSignView.model';
import { dateSortFn } from '@app/_assets/studies/studies.utility';
import { ExternalQualifications, Studies } from '@app/_assets/studies/studies.model';

@Component({
  selector: 'digitalSignView',
  templateUrl: 'digitalSignView.template.html',
  styleUrls: ['digitalSignView.styles.scss'],
})

export class DigitalSignViewComponent implements OnInit {

  data: DSVValue = {};
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
  defaultChecked = true;
  selectedCard = '';

  formGroup: FormGroup = this.formBuilder.group({});

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
    public auth: AuthService,
    private router: ActivatedRoute,
    private translate: TranslateService,
    public formBuilder: FormBuilder,
    private location: Location,
  ) { }

  fetchData() {
    this.defaultChecked = true;
    this.loading = true;
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/digital_sign_data?_format=json`,
      )
      .subscribe(
        (response: DSVResponse) => {
          if (response.error) {
            this.error = true;
            const currentLang = 'et';
            this.alertsService
              .info(response.error.message_text[currentLang], 'studies', 'studies', false, false);
          } else {
            const responseData = response.value;
            // Merge all types of study into one
            responseData.oping = [
              ...responseData.oping,
              ...responseData.valineKvalifikatsioon.map(r => {
                r.tyyp = 'VALISMAA';
                return r;
              }),
              ...responseData.enne2004Kvalifikatsioon.map(r => {
                r.tyyp = 'ENNE_2004_EESTI';
                return r;
              }),
            ];
            // Sort values
            Object.entries(responseData).map(([key, val]) => {
              const keyVal: any = val;
              this.data[key] = this.sortValue(key, keyVal);
            });
            this.data.kvalifikatsioon
              .sort((a, b) => b.aasta - a.aasta)
              .map(elem => elem.typeName = 'kvalifikatsioon');
            // Merge qualifications
            this.data.kvalifikatsioonid =
              [...this.data.kvalifikatsioon, ...this.data.tasemeharidus];
            // Delete unnecessary data
            delete this.data.kvalifikatsioon;
            delete this.data.tasemeharidus;
            delete this.data.valineKvalifikatsioon;
            delete this.data.enne2004Kvalifikatsioon;
            console.log(this.data)
            this.initFormGroup();
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
  initFormGroup() {
    const defaultValue = {};
    Object.entries(this.data).map(([key, val]) => {
      this.formGroup.addControl(key, this.formBuilder.control(''));
      defaultValue[key] = this.defaultChecked;
      const block: any = val;
      block.map((blockVal) => {
        this.formGroup.addControl(blockVal.id, this.formBuilder.control(''));
        defaultValue[blockVal.id] = this.defaultChecked;
      });
    });
    this.formGroup.setValue(defaultValue);
    this.formGroup.updateValueAndValidity();
    // this.formGroup.addControl(el.modelName, el.formControl);
  }
  sortValue(key = '', value = []) {
    switch (key) {
      case 'oping':
        return [
          ...value.filter(x => (x as Studies).staatus === 'OPIB_HETKEL').sort(dateSortFn),
          ...value.filter(x => (x as Studies).staatus !== 'OPIB_HETKEL').sort((a, b) => dateSortFn(a, b, 'oppLopp')),
        ]
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
  /**
   * Get the title for the accordion according to the item
   * @param item Study or External Qualification
   */
  public getAccordionTitle(item: Studies | ExternalQualifications): string {
    const test1 = item as Studies;
    if (test1.oppeasutus) {
      return test1.oppeasutus
        + (test1.staatus ? ', ' + this.parseTypeTranslation(test1.staatus) : '')
        + (test1.oppLopp ? ' ' + test1.oppLopp : '');
    }
    const test2 = item as ExternalQualifications;
    return (test2.oppeasutuseNimi
        || test2.oppeasutuseNimiTranslit
        || test2.oppeasutuseNimiMuusKeeles
        || '').trim()
      + (test2.valjaandmKp
        ? ', ' + this.parseTypeTranslation('LOPETANUD') + ' ' + test2.valjaandmKp
        : '');
  }
  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type.toLocaleLowerCase();
    }
    return translation.toLocaleLowerCase();
  }
  getSignedFile() {
    this.loading = true;
    this.alertsService.clear('studies');
    const checked = [];
    Object.entries(this.formGroup.value).filter(([key, val]) => {
      if (val) {
        checked.push(key);
      }
    });
    if (!checked.length) {
      this.alertsService.error('errors.empty_selection', 'studies');
      document.querySelector('.app-content').scrollTop = 0;
      this.loading = false;
    } else {
      const url = `${this.settings.url}/digi-signed`;
      const body = {
        andmeplokk: [],
        andmekirje: checked,
        valjundiTyyp: [],
      };
      this.http.post(url, body).subscribe((response: any) => {
        if (response.fileName && response.value) {
          this.saveFile(response);
        } else {
          this.loading = false;
        }
      });
    }
  }
  toggleCard(key, index) {
    this.data[key][index].selected = !this.data[key][index].selected;
  }
  cancelEventHandler() {
    this.location.back();
  }
  getWorkingLabel(item) {
    if (item.ametikohtLopp) {
      return `${item.oppeasutus}, ${
        this.translate.get('frontpage.lopetatud')
      } ${item.ametikohtLopp}`;
    }
    return `${item.oppeasutus}`;
  }
  getQualificationLabel(item) {
    if (item.aasta) {
      return `${item.oppeasutus}, ${item.aasta}`;
    }
    if (item.lopetanud && item.lopetanud !== null) {
      return `${item.oppeasutus}, ${moment(item.lopetanud, 'DD.MM.YYYY').year()}`;
    }
    return item.oppeasutus;
  }
  toggleSelect(key, event) {
    const checked = event.target.checked;
    const newValue = this.formGroup.value;
    this.data[key].map((val) => {
      newValue[val.id] = checked;
      // this.formGroup.value[val.id] = checked;
    });
    this.formGroup.setValue(newValue);
    this.formGroup.updateValueAndValidity();
  }
  saveFile(file) {
    const blob = this.b64toBlob(file.value, 'application/vnd.etsi.asic-e+zip');
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, file.fileName);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = file.fileName;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
    this.loading = false;
  }
  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = Array(slice.length);
      // tslint:disable-next-line: no-increment-decrement
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  ngOnInit() {
    this.fetchData();
  }
}
