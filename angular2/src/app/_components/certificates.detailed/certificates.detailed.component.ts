import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from '../../../../node_modules/rxjs';
import { RootScopeService } from '@app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';

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
  
  public userData;

  public loading: boolean;
  private error: boolean;
  private viewChecked: boolean = false;
  
  public subscriptions: Subscription[] = [];

  constructor(
    private user: UserService,
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

    let sub = this.http.get('/dashboard/kodanikKutsetunnistus/null?_format=json').subscribe(response => {
      this.loading = false;

      if(response['error']){
        this.error = true;
      } else {
        this.professionalCertificates = response['value']['kutsetunnistused']
        console.log(this.professionalCertificates);
        
        this.certificate = this.professionalCertificates.find(cert => cert.registrinumber == this.certificateId);
        this.certificate['valjaantud'] = this.certificate['valjaantud'].split("-").reverse().join('.');
        this.certificate['kehtibalates'] = this.certificate['kehtibalates'].split("-").reverse().join('.');
        this.certificate['kehtibkuni'] = this.certificate['kehtibkuni'].split("-").reverse().join('.');
          
        let url = this.path.split('/');
        this.dashboardLink = url.splice(0,url.length-1).join('/');
      
        if(!this.certificate) this.router.navigateByUrl( this.dashboardLink );
      }
      sub.unsubscribe();
    });
    
  }
  ngOnInit(){
    this.userData = this.user.getData();
    if(this.userData.isExpired === true){
      this.router.navigateByUrl('');
    }
    this.pathWatcher();
    this.loadCertificate();
  }

  ngAfterViewChecked() {
    if (this.certificate && !this.loading && this.dashboardLink && !this.viewChecked) {
      document.getElementById('backToDashboard').focus();
      this.viewChecked = true;
    }
  }

}