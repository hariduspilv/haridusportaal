import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from '../../../../node_modules/rxjs';
import { RootScopeService } from '@app/_services/rootScopeService';
@Component({
  selector: 'certificates-detailed',
  templateUrl: './certificates.detailed.template.html',
  styleUrls: ['./certificates.detailed.styles.scss']
})
export class CertificatesDetailedComponent implements OnInit{
  private professionalCertificates;
  public lang: string;
  public path: string;
  public certificateId: any;
  public certificate: {};
  public dashboardLink;

  public loading: boolean;
  private error: boolean;
  
  public subscriptions: Subscription[] = [];

  constructor(
    private rootScope: RootScopeService,
    public http: HttpService,
    private route: ActivatedRoute,
    private router: Router,) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/dashboard/certificates/'+ this.certificateId,
      'et': '/et/toolaud/tunnistused/'+ this.certificateId
    });
  }
  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        this.certificateId = params['id'];
      }
    );
    this.setPaths();
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
        console.log(this.professionalCertificates);
        
        this.certificate = this.professionalCertificates.find(cert => cert.registrinumber == this.certificateId);
        
        let url = this.path.split('/');
        this.dashboardLink = url.splice(0,url.length-1).join('/');
      
        if(!this.certificate) this.router.navigateByUrl( this.dashboardLink );
      }
      sub.unsubscribe();
    });
    
  }
  ngOnInit(){
    
    this.pathWatcher();
    this.loadCertificate();
  }
}