import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';
import { TableService } from '@app/_services/tableService';
import { SettingsService } from '@app/_services/settings.service';
import { NotificationService } from '@app/_services';

@Component({
  selector: 'certificates-detailed',
  templateUrl: './certificates.detailed.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})
export class CertificatesDetailedComponent implements OnInit{
  private professionalCertificates;
  public examResults;
  public downloadId;
  public lang: string;
  public path: string;
  public certificateId: any;
  public certificate: {};
  public dashboardLink;
  public tableOverflown: any = {};
  public elemAtStart: any = {};
  public opened: any = {};
  public examsView: boolean = false;
  public breadcrumbs;
  public userData;

  public loading: boolean;
  private error: boolean;
  private viewChecked: boolean = false;
  private initialCrumbs = {
    'et': [{"text": "Avaleht", "url": "/"}, {"text": "Tunnistused", "url": "/töölaud/tunnistused"}]
  };
  public subscriptions: Subscription[] = [];

  constructor(
    private tableService: TableService,
    private user: UserService,
    private rootScope: RootScopeService,
    public http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private settings: SettingsService,
    private notificationService: NotificationService
  ) {}

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.certificateId = params['id'];
      }
    );
    this.subscriptions = [...this.subscriptions, subscribe];
  }
  loadCertificate() {
    this.loading = true;

    let sub = this.http.get('/dashboard/certificates/getProfessionalCertificate?_format=json').subscribe((response:any) => {
      this.loading = false;
      if(!response.value){
        this.router.navigateByUrl( this.dashboardLink );
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

    let sub = this.http.get("/state-exams/" + id + "?_format=json").subscribe((response: any) => {
      if(response.error) {
        this.loading = false;
        this.notificationService.error('errors.examinations_data_request', 'certificates', false);
      }
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
      this.loading = false;
      this.router.navigateByUrl( this.dashboardLink );
    });
  }
  
  constructCrumbs() {
    let crumbs = this.initialCrumbs[this.lang];
    let translations = {
      'en': ['Certificate', 'Examinations'],
      'et': ['Tunnistus', 'Eksamitulemused']
    }
    var crumbText = this.examsView ? translations[this.lang][1] : translations[this.lang][0];
    return [...crumbs, {text: crumbText, url: ''}];
  }

  downloadCertificate() {
    let token = sessionStorage.getItem('token');
    return this.settings.url + '/certificate-download/' + this.downloadId + '?jwt_token=' + token;
  }

  ngOnInit(){
    this.lang = this.rootScope.get("lang");
    this.examsView = this.route.snapshot.queryParams['exams'];
    this.userData = this.user.getData();
    if(this.userData.isExpired === true){
      this.router.navigateByUrl('');
    }

    this.pathWatcher();

    let url = this.path.split('/');
    this.dashboardLink = decodeURI(  url.splice(0,url.length-1).join('/') );

    if (this.examsView) {
      this.loadExaminations(this.certificateId);
    } else {
      this.loadCertificate();
    }
    this.breadcrumbs = this.constructCrumbs();
  }
  ngAfterViewChecked() {
    if(!this.viewChecked && document.getElementById('heading')) {
      document.getElementById('heading').focus();
      this.viewChecked = true;
    }
  }

}