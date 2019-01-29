import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RECAPTCHA_LANGUAGE } from 'ng-recaptcha';
import { TableService } from '@app/_services';
import { SettingsService } from '@app/_core/settings';

@Component({
  templateUrl: './certificate.check.template.html',
  styleUrls: ['./certificate.check.styles.scss'],
  providers: [{
    provide: RECAPTCHA_LANGUAGE,
    useValue: 'et'
  }]
})

export class CertificateCheckComponent {

  private querySubscription: Subscription;  
  private loader: boolean = false;
  private errorRequest: any = false;
  private certificateData: any = false;
  public tableOverflown: any = false;
  public elemAtStart: any = true;
  public initialized: any = false;
  private error: {} = {
    captcha: false,
    request: false,
    file: false
  };
  private resultSetIds: {} = {
    id_code: null,
    certificate_id: null
  };
  private model: {} = {
    id_code: '',
    certificate_id: ''
  };

  constructor(
		private router: Router,
		private route: ActivatedRoute,
    private http: HttpService,
    private tableService: TableService,
    private settings: SettingsService
  ) {}

  checkCertificate() {
    const { model, error } = this;
    Object.keys(error).forEach(v => error[v] = false);
    this.certificateData = false;
    if( this.querySubscription ){
      this.querySubscription.unsubscribe();
    }
    if (!model['captcha']) {
      this.error['captcha'] = true;
      return;
    }
    this.loader = true;
    this.querySubscription = this.http.post('/certificate-public', model).subscribe((response) => {
      if (!response['value']['tunnistus']) {
        this.error['request'] = true;
        this.errorRequest = response['value']['teade'] || false;
      }
      if (response['value']['tunnistus_nr']) {
        this.certificateData = response['value'];
        this.resultSetIds['certificate_id'] = response['value']['tunnistus_nr'];
        this.resultSetIds['id_code'] = model['id_code'];
        this.initialTableCheck('certificateTable');
      }
      this.loader = false;
      this.querySubscription.unsubscribe();
    }, (data) => {
      this.error['request'] = true;
      this.loader = false;
      this.querySubscription.unsubscribe();
    });
  };

  fieldSum() {
    const { certificateData } = this;
    let counter = 0;
    if (certificateData && certificateData.nimi) counter++;
    if (certificateData && certificateData.tunnistus_nr) counter++;
    if (certificateData && certificateData.kehtiv) counter++;
    return counter;
  }

  downloadLink() {
    const { resultSetIds, settings } = this;
    if (resultSetIds['id_code'] && resultSetIds['certificate_id']) {
      return `${settings.url}/certificate-public-download/${resultSetIds['id_code']}/${resultSetIds['certificate_id']}`;
    } else {
      this.error['file'] = true;
      return '';
    }
  }

  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }

}
