import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { Router } from '@angular/router';

@Component({
  selector: 'teachings',
  templateUrl: './teachings.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})

export class TeachingsComponent{
  
  content: any = false;
  openAccordion: any = false;
  loading: boolean = false;
  error: boolean = false;
  dataErr: boolean = false;
  requestErr: boolean = false;
  contentTypes = ['tootamine', 'kvalifikatsioon', 'tasemeharidus', 'taiendkoolitus'];
  accordionStates: Array<Boolean> = [true, false, false, false];
   
  constructor(private http: HttpService, private rootScope: RootScopeService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/teachings?_format=json').subscribe(response => {
      if(response['error']){
        this.error = true;
        this.requestErr = true;
      } else {
        try{
          this.content = response['value'];
          var errorVal = true;
          Object.values(this.content).forEach(elem => {
            if (elem[0]) {errorVal = false;}
          });
          this.error = this.dataErr = errorVal;
          if (this.content ) {

            try{
              this.content.tootamine.sort((a, b) => {
                let obj = this.convertDates(a.ametikohtAlgus, b.ametikohtAlgus);
                return +new Date(obj.valB) - +new Date(obj.valA);
              });
            }catch(err){}

            try{
              this.content.taiendkoolitus.sort((a, b) => {
                let obj = this.convertDates(a.loppKp, b.loppKp);
                return +new Date(obj.valB) - +new Date(obj.valA);
              });
            }catch(err){}

            try{
              this.content.tasemeharidus.sort((a, b) => {
                let obj = this.convertDates(a.lopetanud, b.lopetanud);
                return +new Date(obj.valB) - +new Date(obj.valA);
              });
            }catch(err){}
              
            this.content.kvalifikatsioon.sort((a, b) => b.aasta - a.aasta);
          }
        }catch(err){
          console.log(err);
        }
      }
      sub.unsubscribe();
      this.accordionStates = this.rootScope.get('teachingsAccordion') || [true, false, false, false];
      this.loading = false;
    }, error => {
      this.loading = false;
      this.error = true;
      this.requestErr = true;
    });
  }

  convertDates(dateA, dateB) {
    let arrA = dateA.split('.');
    let valA = arrA[2] + "-" + arrA[1] + "-" + arrA[0];
    let arrB = dateB.split('.');
    let valB = arrB[2] + "-" + arrB[1] + "-" + arrB[0];
    return {valA, valB};
  }

  parseTypeTranslation(type) {
    return "frontpage."+type;
  }
  
  setTeachingsDetail(work, route) {
    this.rootScope.set('teachingsDetail', work);
    this.router.navigateByUrl(this.router.url + "/" + route)
  }

  ngOnDestroy() {
    this.rootScope.set('teachingsAccordion', this.accordionStates);
  }
}
