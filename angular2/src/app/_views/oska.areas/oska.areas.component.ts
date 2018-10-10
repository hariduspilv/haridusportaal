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

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService
  ) {

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
    let url = "/graphql?queryId=oskaFieldDetailView:1&variables=";
    let variables = {
      "path": this.router.url
    };

    url+= JSON.stringify(variables);

    let subscription = this.http.get(url).subscribe( (data) => {
      if ( data['data']['route'] == null ) {
        console.log("Error loading data");
        this.error = true;
        return false;
      }else{
        this.data = data['data']['route']['entity'];
      }

      this.setLangLinks(data);

      if( this.data.fieldOskaVideo ){
        this.video = [this.data.fieldOskaVideo];
      }
    });
  }

  ngOnInit() {
    this.getData();
  }
}
