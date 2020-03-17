import { Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AlertsService, AuthService, SettingsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: './documentCheck.template.html',
  styleUrls: ['documentCheck.styles.scss'],
  selector: 'document-check',
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
  ) {}
  public ngOnInit() {
    this.alertsService.clear('general');
    this.subscribeToAuth();
  }

  public submit() {
    this.alertsService.clear('documentCheck');
    if (this.model.controls.captcha.invalid && !this.loginStatus) {
      this.alertsService.error(
        this.translate.get('errors.captcha'),
        'documentCheck',
        false,
      );
      window.setTimeout(() => {
        this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
      return;
    }
    if (!this.model.controls.document_id.value) {
      this.alertsService.error(
        this.translate.get('documentCheck.doc_nr_missing'),
        'documentCheck',
        false,
      );
      window.setTimeout(() => {
        this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
      return;
    }
    if (this.model.controls.id_code.invalid) {
      this.alertsService.error(
        this.translate.get('documentCheck.idcode_or_bday_missing'),
        'documentCheck',
        false,
      );
      window.setTimeout(() => {
        this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
      return;
    }
    this.loading = true;
    let urlPartial = '';
    if (this.model.value.id_code.includes('.')) {
      urlPartial = `-/${this.model.value.id_code}`;
    } else {
      urlPartial = `${this.model.value.id_code}/-`;
    }
    this.http
      .get(
        `${
          this.settings.ehisUrl
        }/avaandmed/lopudokumendid/${urlPartial}/${encodeURIComponent(
          this.model.value.document_id.replace(/\s/g, '').replace(/\//g, "'"),
        )}/JSON`,
      )
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.body.vastuseKood === 0) {
            const string = this.translate
              .get('documentCheck.found_result')
              .replace(
                '%LIIK%',
                res.body.lopudokumendid.lopudokument[0].onHinneteleht === '1'
                  ? res.body.lopudokumendid.lopudokument[0]
                    .hinneteleheNimetus.replace(/&apos;/g, "'")
                  : res.body.lopudokumendid.lopudokument[0]
                      .pohiDokumendiLiigiNimetus.replace(/&apos;/g, "'"),
              )
              .replace(
                '%VASTAVUS%',
                res.body.lopudokumendid.lopudokument[0].vastavuseNimetus.replace(/&apos;/g, "'"),
              );
            this.alertsService.success(string, 'documentCheck', false);
          }
          if (res.body.vastuseKood === 1) {
            this.alertsService.warning(
              res.body.koodiSelgitus,
              'documentCheck',
              false,
            );
          }
          if (res.body.vastuseKood === 2) {
            this.alertsService.error(
              res.body.koodiSelgitus,
              'documentCheck',
              false,
            );
          }
          window.setTimeout(() => {
            this.scrollTarget.nativeElement.scrollIntoView({
              behavior: 'smooth',
            });
          }, 1000);
        },
        (error) => {
          this.alertsService.error(
            this.translate.get('errors.request'),
            'documentCheck',
            false,
          );
          this.loading = false;
          window.setTimeout(() => {
            this.scrollTarget.nativeElement.scrollIntoView({
              behavior: 'smooth',
            });
          }, 1000);
        },
      );
  }

  private subscribeToAuth() {
    this.auth.isAuthenticated.pipe(take(1)).subscribe((val) => {
      this.loginStatus = val;
    });
  }

  private validateIdCodeOrBirthday(control: AbstractControl) {
    if (
      !control.value.match(
        /([1-6][0-9]{2}[0,1][0-9][0,1,2,3][0-9][0-9]{4})|(([0-9]{2}\.)([0-9]{2}\.)[0-9]{4})/g,
      )
    ) {
      return { errors: false };
    }
    return null;
  }
}
