import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'teachings',
  templateUrl: './teachings.template.html',
  styleUrls: ['./teachings.styles.scss']
})

export class TeachingsComponent{
  
  content: any = false;
  loading: boolean = false;
  error: boolean = false;
  errorMessage: any = false;
   
  constructor(private http: HttpService) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/teachings?_format=json').subscribe(response => {
      if(response['error']){
        this.error = true;
      } else {
        this.content = response['oping']['value'];
      }
      sub.unsubscribe();
      this.loading = false;
    });
  }
    
}
