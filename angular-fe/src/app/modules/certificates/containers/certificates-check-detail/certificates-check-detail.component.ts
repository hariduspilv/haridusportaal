import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AlertsService, SettingsService } from '@app/_services';
import { Location } from '@angular/common';

@Component({
  selector: 'certificates-check-detail',
  templateUrl: './certificates-check-detail.component.html',
  styleUrls: ['./certificates-check-detail.component.scss'],
})
export class CertificatesCheckDetailComponent implements OnInit {

  public resultSetIds = {
    id_code: null,
    certificate_id: null,
  };

  public model: UntypedFormGroup = this.formBuilder.group({
    captcha: ['', Validators.required],
    id_code: ['', Validators.required],
    certificate_id: ['', Validators.required],
  });

  public dataFetched = false;
  public loading = false;
  public certificateData: any = {};
  public tableOverflown = false;

  public initialized = false;

  public path = this.location.path();

  constructor(
    private formBuilder: UntypedFormBuilder,
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

  fieldSum() {
    let counter = 0;
    if (this.certificateData && this.certificateData.nimi) counter += 1;
    if (this.certificateData && this.certificateData.tunnistus_nr) counter += 1;
    if (this.certificateData && this.certificateData.kehtiv) counter += 1;
    return counter;
  }

  downloadLink() {
    if (this.resultSetIds['id_code'] && this.resultSetIds['certificate_id']) {
      return `${this.settings.url}/certificate-public-download/${this.resultSetIds['id_code']}/${this.resultSetIds['certificate_id']}`;
    }
    this.alertsService.error('errors.file', 'general', false);
  }

  submit() {
    this.alertsService.clear('certificateCheck');
    if (this.model.controls.captcha.invalid) {
      this.alertsService.error(this.translate.get('errors.captcha'), 'certificateCheck', false);
      return;
    }
    this.loading = true;
    this.http.post(`${this.settings.url}/certificate-public`, this.model.value).subscribe({
      next: (response: any) => {
        if (response.value && response.value.tunnistus === null) {
          this.alertsService
            .error(response.value.teade, 'certificateCheck', false);
        }
        if (response.value && response.value.tunnistus_nr) {
          this.certificateData = response.value;
          this.resultSetIds['certificate_id'] = response.value.tunnistus_nr;
          this.resultSetIds['id_code'] = this.model['id_code'];
          this.initialTableCheck('certificateTable');
        }
        this.loading = false;
      },
      error: (error) => {
        this.alertsService.error(this.translate.get('errors.request'), 'certificateCheck', false);
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.alertsService.clear('general');
  }

}
