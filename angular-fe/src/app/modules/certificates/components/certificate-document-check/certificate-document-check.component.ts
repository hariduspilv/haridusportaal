import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AlertsService, SettingsService, AuthService } from '@app/_services';
import { take } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'certificate-document-check',
  templateUrl: './certificate-document-check.component.html',
  styleUrls: ['./certificate-document-check.component.scss'],
})
export class CertificateDocumentCheckComponent implements OnInit {

  public resultSetIds = {
    id_code: null,
    certificate_id: null,
  };

  public model: UntypedFormGroup = this.formBuilder.group({
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
  @ViewChild('scrollTarget') public scrollTarget;
  constructor(
    private formBuilder: UntypedFormBuilder,
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
    if (!this.model.controls.document_id.value) {
      this.alertsService.error(
        this.translate.get('documentCheck.doc_nr_missing'),
        'documentCheck',
        false,
      );
      window.setTimeout(() => {
        this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
      },                1000);
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
      },                1000);
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
      .subscribe({
        next: (res: any) => {
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
          },                1000);
        },
        error: (error) => {
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
          },                1000);
        },
      });
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
