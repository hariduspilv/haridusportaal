import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { NotificationService, RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';

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
  oppelaenOigus: any = false;
  public expandedStates: boolean[] = [];
  public stateChanged: boolean;
   
  constructor(
    private http: HttpService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private rootScope: RootScopeService
  ) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/studies?_format=json').subscribe((response: any) => {
      if(response.error){
        this.error = true;
        this.requestErr = true;
        const currentLang = this.rootScope.get('lang')
        this.notificationService.info(response.error.message_text[currentLang], 'studies', false);
      } else {
        if (response['value'] && response['value']['isikuandmed']) {
          this.oppelaenOigus = response['value']['isikuandmed']['oppelaenOigus'];
        }
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
          this.notificationService.info('errors.studies_data_missing', 'studies', false);
        } else {
          this.initializeAccordionStates(this.content);
        }
      }
      sub.unsubscribe();
      this.loading = false;
    }, error => {
      this.loading = false;
      this.error = true;
      this.requestErr = true;
      this.notificationService.error('errors.studies_data_request', 'studies', false);
    });
  }

  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`)['value'].toString();
    if(translation.includes(`frontpage.${type}`)){
      return type;
    }
    return translation;
  }

  initializeAccordionStates(arr: object[]) {
    arr.forEach(() => this.expandedStates.push(false));
  }

  setAccordionStates(state: boolean) {
    this.stateChanged = true;
    this.expandedStates = this.expandedStates.map(elem => elem = state);
  }

  closedAccordionsExist(): number {
    return this.expandedStates.filter(elem => elem === false).length;
  }
  //YYYY-MM-DD to DD.MM.YYYY
  // dateFormatter(date) {
  //   let dateOfBirthArr = date.split('-');
  //   return `${dateOfBirthArr[2]}.${dateOfBirthArr[1]}.${dateOfBirthArr[0]}`;
  // }

}

