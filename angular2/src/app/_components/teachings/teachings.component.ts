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
  loading: boolean = false;
  error: boolean = false;
  dataErr: boolean = false;
  requestErr: boolean = false;
  contentTypes = ['tootamine', 'kvalifikatsioon', 'tasemeharidus', 'taiendkoolitus'];
   
  constructor(private http: HttpService, private rootScope: RootScopeService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    let sub = this.http.get('/dashboard/eeIsikukaart/teachings?_format=json').subscribe(response => {
      if(response['error']){
        this.error = true;
        this.dataErr = true;
      } else {
        this.content = response['value'];
        var errorVal = true;
        Object.values(this.content).forEach(elem => {
          if (elem[0]) {errorVal = false;}
        });
        this.error = this.dataErr = errorVal;
        if (this.content ) {
          this.content.tootamine.sort((a, b) => +new Date(b.ametikohtAlgus) - +new Date(a.ametikohtAlgus));
          this.content.taiendkoolitus.sort((a, b) => +new Date(b.loppKp) - +new Date(a.loppKp));
          this.content.tasemeharidus.sort((a, b) => +new Date(b.lopetanud) - +new Date(a.lopetanud));
          this.content.kvalifikatsioon.sort((a, b) => b.aasta - a.aasta);
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

  parseTypeTranslation(type) {
    return `frontpage.${type}`;
  }

  setTeachingsDetail(work, route) {
    this.rootScope.set('teachingsDetail', work);
    this.router.navigateByUrl(`${this.router.url}/${route}`)
  }
}
