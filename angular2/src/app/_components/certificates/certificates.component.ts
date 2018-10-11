import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router } from '@angular/router';
import { RootScopeService } from '@app/_services';
@Component({
  selector: 'certificates',
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss']
})

export class CertificatesComponent implements OnInit{
  public loading = {};

  public error: boolean = false;

  public professionalCertificates: any;
  public examResults: any;
  public examResultsErr: string;
  public errData: boolean;
  public errRequest: boolean;
  public accordionStates: Array<Boolean>;

  public accordionSection: {}[] = [
    {_id: 'professional-certificates', label: 'frontpage.dashboard_tabs_certificates_professional'},
    {_id: 'state-exams', label: 'frontpage.dashboard_tabs_certificates_examinations'},
  ];

  constructor(
    public router: Router,
    public http: HttpService,
    public rootScope: RootScopeService
  ) {}

  dataController(_id: string){
    switch(_id){
      case 'professional-certificates': 
        this.getProfessionalCertificates(_id);
        break;
      case 'state-exams': 
        this.getExamResults(_id);
        break;
    }
  }
  
  getProfessionalCertificates(_id){
    
    this.loading[_id] = true;

    let sub = this.http.get('/dashboard/certificates/getProfessionalCertificate?_format=json').subscribe(response => {
      this.loading[_id] = false;

      if(response['error']){
        this.error = true;
      } else {
        this.professionalCertificates = response['value']['kutsetunnistused'];
        
        if(this.professionalCertificates.length){  
          this.professionalCertificates.forEach(certificate => {
            certificate.path = this.router.url + '/' + certificate.registrinumber;
          })
          let regex = /(\d{2}).(\d{2}).(\d{4})/;
          this.professionalCertificates = this.professionalCertificates.sort(function(a,b){
            return Number(new Date(b.valjaantud.replace( regex , "$2/$1/$3" ))) - Number(new Date(a.valjaantud.replace( regex, "$2/$1/$3")));
          });
          this.professionalCertificates.forEach(certificate => {
            certificate.valjaantud = certificate.valjaantud.split("-").reverse().join('.');
          })
        }
        
        sub.unsubscribe();
      }
    }, (err) => {
      console.log(err);
      this.loading[_id] = false;
    });
  }

  getExamResults(_id){
    this.loading[_id] = true;
    let sub = this.http.get('/dashboard/certificates/getTestSessions?_format=json').subscribe(response => {
      if(response['value']['teade'] || response['value']['testsessioonid_kod_jada'] === []){
        this.examResultsErr = response['value']['teade'];
      } else {
        this.examResults = response['value']['testsessioonid_kod_jada'].sort((a, b) => b.oppeaasta - a.oppeaasta);
      };
      this.loading[_id] = false;
      sub.unsubscribe();
    }, (err) => {
      this.errRequest = true;
      console.log(err);
      this.loading[_id] = false;
    });
  }

  ngOnInit () {
    this.accordionStates = this.rootScope.get('certificatesAccordion') || [true, false];
    if(!this.accordionStates[0]) {this.professionalCertificates = [];}
  }
  ngOnDestroy() {
    this.rootScope.set('certificatesAccordion', this.accordionStates);
  }
}
