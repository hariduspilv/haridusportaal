import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { ActivatedRoute, Router } from '@angular/router';
import { RootScopeService } from 'app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';

@Component({
  selector: "oska-areas-component",
  templateUrl: "oska.areas.template.html",
  styleUrls: ["oska.areas.styles.scss"]
})

export class OskaAreasComponent implements OnInit{

  @Input() inputData:any;
  data: any = false;
  video: any = false;
  error: boolean = false;
  compareButton: boolean = false;
  viewType : string;
  public sidebarData: any = false;
  private userLoggedOut: boolean = false;

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService,
    private user: UserService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  getData(){

    if( this.inputData ){
      this.data = this.inputData;
      if (this.data.fieldSidebar) {
        this.sidebarData = this.data.fieldSidebar.entity;
      } else if (this.data.fieldOskaFieldSidebar) {
        this.sidebarData = this.data.fieldOskaFieldSidebar.entity;
      } else if (this.data.fieldSurveyPageSidebar) {
        this.sidebarData = this.data.fieldSurveyPageSidebar.entity;
      }

      this.viewType = "field";

      if( this.data.entityBundle == "oska_main_profession_page" ){
        this.viewType = "mainProfession";
        this.compareButton = true;
      }
      else if( this.data.entityBundle == "oska_survey_page" ){
        this.viewType = "surveyPage";
      }

    }else{
      let url = "/graphql?queryName=oskaFieldDetailView&queryId=eda8309b67b34f696fd90b34a67d0a0685d2fdd3:1&variables=";

      this.viewType = "field";

      if( decodeURI(this.router.url).match(/ametialad|sectors/ ) ){
        this.viewType = "mainProfession";
        url = "/graphql?queryName=oskaMainProfessionDetailView&queryId=52e151037d8279305fb4b040b81941f2ab9e1cb0:1&variables=";
        this.compareButton = true;
      }
      else if( decodeURI(this.router.url).match(/tööjõuprognoos|survey-pages/ ) ){
        this.viewType = "surveyPage";
        url = "/graphql?queryName=oskaSurveyPageDetailView&queryId=30080f40d5c2f992f18cd959930f20409ae73146:1&variables=";
      }

      let variables = {
        "path": decodeURI(this.router.url)
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

        subscription.unsubscribe();

      });
    }
    
  }

  ngOnInit() {
    this.userLoggedOut = this.user.getData()['isExpired'];
    this.getData();
  }
}
