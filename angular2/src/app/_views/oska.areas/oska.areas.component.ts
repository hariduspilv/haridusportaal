import { Component, OnInit } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { ActivatedRoute, Router } from '@angular/router';
import { RootScopeService } from 'app/_services/rootScopeService';

@Component({
  templateUrl: "oska.areas.template.html",
  styleUrls: ["oska.areas.styles.scss"]
})

export class OskaAreasComponent implements OnInit{

  data: any = false;
  video: any = false;
  error: boolean = false;
  compareButton: boolean = false;
  viewType : string;
  public sidebarData: any = false;

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  setLangLinks(data){
    //language service
    const langOptions = data['data']['route']['languageSwitchLinks'];
    let langValues = {};
    for( var i in langOptions ){
      langValues[langOptions[i].language.id] = langOptions[i].url.path;
    }
    this.rootScope.set('langOptions', langValues);
  }

  getData(){
    let url = "/graphql?queryName=oskaFieldDetailView&queryId=58404416fc8c07177d1aabfb82d914ba0494f1ed:1&variables=";

    this.viewType = "field";

    if( this.router.url.match(/ametialad|sectors/ ) ){
      this.viewType = "mainProfession";
      url = "/graphql?queryId=e7c86e79094d28c4c6b280535303a638bbfb46de:1&variables=";
      this.compareButton = true;
    }
    else if( this.router.url.match(/ulduuringud|survey-pages/ ) ){
      this.viewType = "surveyPage";
      url = "/graphql?queryName=oskaSurveyPageDetailView&queryId=30080f40d5c2f992f18cd959930f20409ae73146:1&variables=";
    }

    let variables = {
      "path": this.router.url
    };

    url+= JSON.stringify(variables);

    let subscription = this.http.get(url).subscribe( (data) => {
      if ( data['data']['route'] == null ) {
        this.error = true;
        return false;
      }else{
        this.data = data['data']['route']['entity'];
      }

      if (this.data.fieldSidebar) {
        this.sidebarData = this.data.fieldSidebar.entity;
      } else if (this.data.fieldOskaFieldSidebar) {
        this.sidebarData = this.data.fieldOskaFieldSidebar.entity;
      } else if (this.data.fieldSurveyPageSidebar) {
        this.sidebarData = this.data.fieldSurveyPageSidebar.entity;
      }

      this.setLangLinks(data);

      subscription.unsubscribe();

    });
  }

  ngOnInit() {
    this.getData();
  }
}
