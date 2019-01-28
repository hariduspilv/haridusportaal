import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RECAPTCHA_LANGUAGE } from 'ng-recaptcha';

@Component({
  templateUrl: './certificate.check.template.html',
  styleUrls: ['./certificate.check.styles.scss'],
  providers: [{
    provide: RECAPTCHA_LANGUAGE,
    useValue: 'et'
  }]
})

export class CertificateCheckComponent implements OnInit {

  private querySubscription: Subscription;  
  private error: boolean;

  constructor(
		private router: Router,
		private route: ActivatedRoute,
    private http: HttpService
  ) {}

  ngOnInit() {}
}
