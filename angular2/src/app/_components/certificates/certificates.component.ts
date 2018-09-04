import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router } from '@angular/router';
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

  public accordionSection: {}[] = [
    {_id: 'professional-certificates', label: 'frontpage.dashboard_tabs_certificates_professional'},
    {_id: 'state-exams', label: 'frontpage.dashboard_tabs_certificates_examinations'},
  ];

  constructor(
    public router: Router,
    public http: HttpService,
  ) {}

  dataController(_id: string){
    switch(_id){
      case 'professional-certificates': 
        if(this.professionalCertificates === undefined) this.getProfessionalCertificates(_id);
        break;
      case 'state-exams': 
        if(this.examResults === undefined) this.getExamResults(_id);
        break;
    }
  }
  
  getProfessionalCertificates(_id){
    
    this.loading[_id] = true;

    let sub = this.http.get('/professional-certificate?_format=json').subscribe(response => {
      this.loading[_id] = false;

      if(response['error']){
        this.error = true;
      } else {
        this.professionalCertificates = response['value']['kutsetunnistused']
        let temp = [];
        //DUMMY DATA from dummy data :)
        for(let x = 0; x < this.professionalCertificates.length; x++){
          for(let i = 2; i < 10; i++){
            let cert = JSON.parse(JSON.stringify(this.professionalCertificates[x]));
            cert.nimi += 'ddata' + i;
            cert.valjaantud = cert.valjaantud.substring(0, 3) + "0" + i + cert.valjaantud.substring(5, cert.valjaantud.length);
            
            cert.path = this.router.url + '/' + cert.registrinumber;
            temp.push(cert);
          }
        }
        this.professionalCertificates = temp;
       
        let regex = /(\d{2}).(\d{2}).(\d{4})/;
        this.professionalCertificates = this.professionalCertificates.sort(function(a,b){
          return Number(new Date(a.valjaantud.replace( regex , "$2/$1/$3" ))) - Number(new Date(b.valjaantud.replace( regex, "$2/$1/$3")));
        });
        sub.unsubscribe();
      }
    });
  }

  getExamResults(_id){
    this.loading[_id] = true;
    
    this.examResults = [];
  }

  ngOnInit(){
    
  }
}
