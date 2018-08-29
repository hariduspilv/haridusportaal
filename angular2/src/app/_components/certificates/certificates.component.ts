import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'certificates',
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss']
})

export class CertificatesComponent implements OnInit{
  public loading = {};

 

  public professionalCertificates: any;
  public examResults: any;

  public accordionSection: {}[] = [
    {_id: 'professional-certificates', label: 'KUTSETUNNISTUSED'},
    {_id: 'state-exams', label: 'RIIGIEKSAMID'},
  ];

  constructor(
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
    console.log('Getting professional certs');
    this.loading[_id] = true;

    let sub = this.http.get('/professional-certificate?_format=json').subscribe(response => {

      let certs = response['value']['kutsetunnistused']
     
      //repeat dummy data
      for(let i = 2; i < 10; i++){
        let cert = JSON.parse(JSON.stringify(certs[0]));
        cert.nimi += i;
        cert.valjaantud = cert.valjaantud.substring(0, 3) + "0" + i + cert.valjaantud.substring(5, cert.valjaantud.length);
        certs.push(cert);
      }

      this.professionalCertificates = certs
      this.loading[_id] = false;
      sub.unsubscribe();
    });
  }

  getExamResults(_id){
    this.loading[_id] = true;
    console.log('Getting exam results');
    this.examResults = [];
  }

  ngOnInit(){
    
  }
}
