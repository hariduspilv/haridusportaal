import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
  selector: 'certificates-detailed',
  templateUrl: './certificates.detailed.template.html',
  styleUrls: ['./certificates.detailed.styles.scss']
})
export class CertificatesDetailedComponent implements OnInit{
  private professionalCertificates;
  public lang: string;
  public path: string;

  private loading: boolean;
  private error: boolean;
  
  public subscriptions: Subscription[] = [];

  constructor(
    public http: HttpService,
    private route: ActivatedRoute,
    private router: Router,) {}

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  loadCertificate(){

    this.loading = true;

    let sub = this.http.get('/professional-certificate?_format=json').subscribe(response => {
      this.loading = false;

      if(response['error']){
        this.error = true;
      } else {
        this.professionalCertificates = response['value']['kutsetunnistused']
        
      }
      sub.unsubscribe();
    });
    
  }
  ngOnInit(){
   this.loadCertificate();
  }
}