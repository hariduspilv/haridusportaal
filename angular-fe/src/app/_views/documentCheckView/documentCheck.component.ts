import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertsService, SettingsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  templateUrl: './documentCheck.template.html',
  styleUrls: ['documentCheck.styles.scss'],
})
export class DocumentCheckComponent {
  public resultSetIds = {
    id_code: null,
    certificate_id: null,
  };

  public model: FormGroup = this.formBuilder.group({
    captcha: ['', Validators.required],
    id_code: ['', Validators.required],
    document_id: ['', Validators.required],
  });

  public dataFetched = false;
  public loading = false;
  public documentData: any = {};
  public tableOverflown = false;

  public initialized = false;

  public path = this.location.path();

  constructor(
    private formBuilder: FormBuilder,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private settings: SettingsService,
    private http: HttpClient,
    private location: Location,
  ) { }

  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }

  downloadLink() {
    if (this.resultSetIds['id_code'] && this.resultSetIds['certificate_id']) {
      return `${this.settings.url}/certificate-public-download/${this.resultSetIds['id_code']}/${this.resultSetIds['certificate_id']}`;
    }
    this.alertsService.error('errors.file', 'general', false);
  }

  submit() {
    this.alertsService.clear('documentCheck');
    this.http.get('https://ehis2.twn.zone/dehis/avaandmed/rest/lopudokumendid/38603052378/-/024017/JSON').subscribe((val) => {
      console.log(val);
    })
    if (this.model.controls.captcha.invalid) {
      this.alertsService.error(this.translate.get('errors.captcha'), 'documentCheck', false);
      return;
    }
    if (!this.model.controls.document_id.value) {
      this.alertsService
        .error('"Dokumendi nr." väärtus on sisestamata', 'documentCheck', false);
      return;
      }
    if (!this.model.controls.id_code.value) {
      this.alertsService
        .error('"Isikukood" väärtus on sisestamata või ei vasta vormingule', 'documentCheck', false);
      return;
    }
    this.loading = true;
    const elasticQuery = {
      size: 10000,
      query: {
        bool: {
          must: [
            {
              match: {
                NR_QUERY: this.model.controls.document_id.value,
              },
            },
          ],
        },
      },
    };
    // whatever dudeman
    this.http.post(`${this.settings.url}/es-public/tunnistused/_search`, elasticQuery).subscribe(
      (response: any) => {
        if (response.hits.total.value === 0) {
          this.alertsService.warning(
            'Sisestatud andmetega dokumenti ei leitud andmebaasist',
            'documentCheck',
            false,
          );
          this.loading = false;
          return;
        }
        const document = response.hits.hits
          .find(el => el._source.SAAJA_ISIKUKOOD === `${this.model.controls.id_code.value}`)
        if (!document) {
          this.alertsService.warning(
            'Sisestatud andmetega dokumenti pole antud isikule väljastatud',
            'documentCheck',
            false,
          );
          this.loading = false;
          return;
        }
        if (document._source.DOKUMENDI_STAATUS === '0') {
          this.alertsService.error(
            'Sisestatud andmetega dokument on kehtetu',
            'documentCheck',
            false,
          );
          this.loading = false;
          return;
        }
        if (
          document._source.LIIK_NIMETUS &&
          document._source.DOKUMENDI_STAATUS === '1'
        ) {
          this.alertsService.success(
            `Leiti kehtiv "${response.hits.hits[0]._source.LIIK_NIMETUS}" dokument. Dokument vastab hetke tasemele "${response.hits.hits[0]._source.VASTAVUS_NIMETUS}"`,
            'documentCheck',
            false,
          );
        }
        this.loading = false;
      },
      (error) => {
        this.alertsService.error(this.translate.get('errors.request'), 'documentCheck', false);
        this.loading = false;
      });
  };
  ngOnInit() {
    this.alertsService.clear('general');
  }
}
