import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AlertsService, SettingsService, AuthService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { take } from 'rxjs/operators';

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
    id_code: ['', [Validators.required, this.validateIdCodeOrBirthday]],
    document_id: ['', Validators.required],
  });

  public dataFetched = false;
  public loading = false;
  public documentData: any = {};
  public tableOverflown = false;

  public initialized = false;
  public loginStatus = false;

  public path = this.location.path();
  @ViewChild('scrollTarget', { static: false }) public scrollTarget;
  constructor(
    private formBuilder: FormBuilder,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private settings: SettingsService,
    private http: HttpClient,
    private location: Location,
    public auth: AuthService,
  ) { }

  subscribeToAuth() {
    this.auth.isAuthenticated.pipe(take(1)).subscribe((val) => {
      this.loginStatus = val;
    });
  }

  validateIdCodeOrBirthday(control: AbstractControl) {
    if (!control.value.match(/([1-6][0-9]{2}[0,1][0-9][0,1,2,3][0-9][0-9]{4})|(([0-9]{2}\.)([0-9]{2}\.)[0-9]{4})/g)) {
      return { errors: false };
    }
    return null;
  }

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
    if (this.model.controls.captcha.invalid && !this.loginStatus) {
      this.alertsService.error(this.translate.get('errors.captcha'), 'documentCheck', false);
      window.setTimeout(
        () => {
          this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
        },
        1000,
      );
      return;
    }
    if (!this.model.controls.document_id.value) {
      this.alertsService
        .error('"Dokumendi number." väärtus on sisestamata', 'documentCheck', false);
      window.setTimeout(
        () => {
          this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
        },
        1000,
      );
      return;
    }
    if (this.model.controls.id_code.invalid) {
      this.alertsService
        .error(
          '"Isikukood või sünnipäev" väärtus on sisestamata või ei vasta vormingule', 'documentCheck',
          false,
        );
      window.setTimeout(
        () => {
          this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
        },
        1000,
      );
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
    this.http.post(`${this.settings.ehisUrl}/es-public/tunnistused/_search`, elasticQuery).subscribe(
      (response: any) => {
        if (response.hits.total.value === 0) {
          this.alertsService.warning(
            'Sisestatud andmetega dokumenti ei leitud andmebaasist',
            'documentCheck',
            false,
          );
          this.loading = false;
          window.setTimeout(
            () => {
              this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
            },
            1000,
          );
          return;
        }
        let document = response.hits.hits
          .find(el => el._source.SAAJA_ISIKUKOOD === `${this.model.controls.id_code.value}`);
        if (!document) {
          document = response.hits.hits
            .find(el => el._source.SYNNI_KP === `${this.model.controls.id_code.value}`);
        }
        if (!document) {
          this.alertsService.warning(
            'Sisestatud andmetega dokumenti pole antud isikule väljastatud',
            'documentCheck',
            false,
          );
          this.loading = false;
          window.setTimeout(
            () => {
              this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
            },
            1000,
          );
          return;
        }
        if (document._source.DOKUMENDI_STAATUS === '0') {
          this.alertsService.error(
            'Sisestatud andmetega dokument on kehtetu',
            'documentCheck',
            false,
          );
          this.loading = false;
          window.setTimeout(
            () => {
              this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
            },
            1000,
          );
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
        window.setTimeout(
          () => {
            this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
          },
          1000,
        );
        this.loading = false;
      },
      (error) => {
        this.alertsService.error(this.translate.get('errors.request'), 'documentCheck', false);
        this.loading = false;
        window.setTimeout(
          () => {
            this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
          },
          1000,
        );
      });
  };
  ngOnInit() {
    this.alertsService.clear('general');
    this.subscribeToAuth();
  }
}
