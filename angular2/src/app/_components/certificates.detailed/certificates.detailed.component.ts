import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from '../../../../node_modules/rxjs';
import { RootScopeService } from '@app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';
import { TableService } from '@app/_services/tableService';
import { SettingsService } from '@app/_core/settings';

@Component({
  selector: 'certificates-detailed',
  templateUrl: './certificates.detailed.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})
export class CertificatesDetailedComponent implements OnInit{
  private professionalCertificates;
  private examResults;
  public downloadId;
  public lang: string;
  public path: string;
  public certificateId: any;
  public certificate: {};
  public dashboardLink;
  public tableOverflown: any = {};
  public elemAtStart: any = {};
  public opened: any = {};
  
  public userData;

  public loading: boolean;
  private error: boolean;
  private viewChecked: boolean = false;
  
  public subscriptions: Subscription[] = [];

  constructor(
    private tableService: TableService,
    private user: UserService,
    private rootScope: RootScopeService,
    public http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private settings: SettingsService) {}

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
  loadCertificate() {

    this.loading = true;

    let sub = this.http.get('/dashboard/kodanikKutsetunnistus/null?_format=json').subscribe(response => {
      this.loading = false;

      if(response['error']){
        this.error = true;
      } else {
        this.professionalCertificates = response['value']['kutsetunnistused']
        
        this.certificate = this.professionalCertificates.find(cert => cert.registrinumber == this.certificateId);
        this.certificate['valjaantud'] = this.certificate['valjaantud'].split("-").reverse().join('.');
        this.certificate['kehtibalates'] = this.certificate['kehtibalates'].split("-").reverse().join('.');
        this.certificate['kehtibkuni'] = this.certificate['kehtibkuni'].split("-").reverse().join('.');
      
        if(!this.certificate) this.router.navigateByUrl( this.dashboardLink );
      }
      sub.unsubscribe();
    }, (err) => {
      this.loading = false;
      this.router.navigateByUrl( this.dashboardLink );
    });

  }
  openedAcc(id) {
    this.opened[id] = !this.opened[id];
  }

  loadExaminations(id) {

    this.loading = true;

    let sub = this.http.get(`/state-exams/${id}?_format=json`).subscribe(response => {
      if(response['value']['teade'] || response['value']['testid_kod_jada'] === []){
        this.router.navigateByUrl( this.dashboardLink );
      } else {
        this.examResults = response['value']['testid_kod_jada'];
        this.examResults.forEach((elem, index) => {
          this.tableOverflown[index] = true;
          this.elemAtStart[index] = true;
          this.opened[index] = false;
        });
        this.downloadId = response['value']['tunnistus_id'];
      };
      this.loading = false;
      sub.unsubscribe();
    }, (err) => {
      console.log(err);
      this.loading = false;
      this.router.navigateByUrl( this.dashboardLink );
    });
    
  }

  downloadCertificate() {
    let token = localStorage.getItem('token');
    return this.settings.url + '/certificate-download/' + this.downloadId + '?jwt_token=' + token;
  }

  ngOnInit(){
    this.userData = this.user.getData();
    if(this.userData.isExpired === true){
      this.router.navigateByUrl('');
    }

    this.pathWatcher();

    let url = this.path.split('/');
    this.dashboardLink = url.splice(0,url.length-1).join('/');

    if (this.route.snapshot.queryParams['exams']) {
      this.loadExaminations(this.certificateId);
    } else {
      this.loadCertificate();
    }
  }

}