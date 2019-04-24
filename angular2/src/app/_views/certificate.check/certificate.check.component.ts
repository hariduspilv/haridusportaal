import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TableService, NotificationService } from '@app/_services';
import { SettingsService } from '@app/_services/settings.service';
import { UserService } from '@app/_services/userService';

@Component({
  templateUrl: './certificate.check.template.html'
})

export class CertificateCheckComponent {

  public querySubscription: Subscription;  
  public loader: boolean = false;
  public errorRequest: any = false;
  public certificateData: any = false;
  public tableOverflown: any = false;
  public elemAtStart: any = true;
  public initialized: any = false;
  public userLoggedOut: boolean = false;
  public resultSetIds = {
    id_code: null,
    certificate_id: null
  };
  public model = {
    captcha: false,
    id_code: '',
    certificate_id: ''
  };

  constructor(
    private notificationService: NotificationService,
		private router: Router,
		private route: ActivatedRoute,
    private http: HttpService,
    private tableService: TableService,
    private settings: SettingsService,
    private user: UserService
  ) {}

  checkCertificate() {
    const { model } = this;
    this.notificationService.clear('general');
    this.certificateData = false;
    if( this.querySubscription ){
      this.querySubscription.unsubscribe();
    }
    if (!model['captcha'] && this.userLoggedOut) {
      this.notificationService.error('errors.captcha', 'general', false);
      return;
    }
    this.loader = true;
    this.querySubscription = this.http.post('/certificate-public', model).subscribe((response) => {
      if (!response['value']['tunnistus']) {
        this.notificationService.error(response['value']['teade'] || 'errors.request', 'general', false);
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
      this.notificationService.error('errors.request', 'general', false);
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
      this.notificationService.error('errors.file', 'general', false);
    }
  }

  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }

  ngOnInit() {
    this.notificationService.clear('general');
    this.userLoggedOut = this.user.getData()['isExpired'];
  }
}
