import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'studies',
  templateUrl: './studies.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})

export class StudiesComponent{
  
  content: any = false;
  loading: boolean = false;
  error: boolean = false;
  requestErr: boolean = false;
  dataErr: boolean = false;
   
  constructor(private http: HttpService) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/studies?_format=json').subscribe(response => {
      if(response['error']){
        this.error = true;
        this.requestErr = true;
      } else {
        let resultData = response['value']['oping'];
        this.content = resultData.sort((a, b) => {
          let arrA = a.oppAlgus.split('.');
          let valA = arrA[2] + "-" + arrA[1] + "-" + arrA[0];
          let arrB = b.oppAlgus.split('.');
          let valB = arrB[2] + "-" + arrB[1] + "-" + arrB[0];
          return +new Date(valB) - +new Date(valA);
        });
        if (!this.content.length) {
          this.error = true;
          this.dataErr = true;
        }
      }
      sub.unsubscribe();
      this.loading = false;
    }, error => {
      this.loading = false;
      this.error = true;
      this.requestErr = true;
    });
  }

  //YYYY-MM-DD to DD.MM.YYYY
  // dateFormatter(date) {
  //   let dateOfBirthArr = date.split('-');
  //   return `${dateOfBirthArr[2]}.${dateOfBirthArr[1]}.${dateOfBirthArr[0]}`;
  // }

}

