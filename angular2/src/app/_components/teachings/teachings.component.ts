import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService, NotificationService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

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
  public currentDate: Date = new Date();
  contentTypes = ['tootamine', 'kvalifikatsioonid', 'taiendkoolitus'];
  accordionStates: Array<Boolean> = [false, false, false, false];
   
  constructor(private http: HttpService, private rootScope: RootScopeService, private router: Router, private notificationService: NotificationService, private translate: TranslateService) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/teachings?_format=json').subscribe((response: any) => {
      if(response['error']){
        this.error = true;
        this.requestErr = true;
        const currentLang = this.rootScope.get('lang');
        this.notificationService.info(response.error.message_text[currentLang], 'teachings', false);
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
              }).map(elem => elem.typeName = 'tasemeharidus');
            }catch(err){}
              
            this.content.kvalifikatsioon.sort((a, b) => b.aasta - a.aasta).map(elem => elem.typeName = 'kvalifikatsioon');
            this.content.kvalifikatsioonid = [...this.content.kvalifikatsioon, ...this.content.tasemeharidus];
          }
          if(errorVal) {
            throw new Error();
          }
        }catch(err){
          console.log(err);
          this.notificationService.info('errors.teachings_data_missing', 'teachings', false);

        }
      }
      sub.unsubscribe();
      this.accordionStates = this.rootScope.get('teachingsAccordion') || [false, false, false, false];
      this.loading = false;
    }, error => {
      this.loading = false;
      this.error = true;
      this.requestErr = true;
      this.notificationService.error('errors.teachings_data_request', 'teachings', false);
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
    const translation = this.translate.get(`frontpage.${type}`)['value'].toString();
    if(translation.includes(`frontpage.${type}`)){
      return type;
    }
    return translation;
  }
  
  setTeachingsDetail(work, route) {
    this.rootScope.set('teachingsDetail', work);
    this.router.navigateByUrl(this.router.url + "/" + route)
  }

  isDateInPast(date) {
    let dateArr = date.split('.');
    let formattedDate = `${dateArr[1]}/${dateArr[0]}/${dateArr[2]}`;
    return new Date(formattedDate).setHours(0, 0, 0, 0) < this.currentDate.setHours(0, 0, 0, 0)
  }

  ngOnDestroy() {
    this.rootScope.set('teachingsAccordion', this.accordionStates);
  }
}
//