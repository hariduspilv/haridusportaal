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
  public competitionLabels = ['oska.simple_extended', 'oska.quite_simple_extended', 'oska.medium_extended', 'oska.quite_difficult_extended', 'oska.difficult_extended'];

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
      let url = "oskaFieldDetailView";

      this.viewType = "field";

      if( decodeURI(this.router.url).match(/ametialad|sectors/ ) ){
        this.viewType = "mainProfession";
        url = "oskaMainProfessionDetailView";
        this.compareButton = true;
      }
      else if( decodeURI(this.router.url).match(/tööjõuprognoos|survey-pages/ ) ){
        this.viewType = "surveyPage";
        url = "oskaSurveyPageDetailView";
      }

      let variables = {
        "path": decodeURI(this.router.url)
      };

      let subscription = this.http.get(url, {params:variables}).subscribe( (data) => {
        if ( data['data']['route'] == null ) {
          this.error = true;
          return false;
        }else{
          this.data = data['data']['route']['entity'];
          if (this.data.reverseFieldOskaFieldParagraph && this.data.reverseFieldOskaFieldParagraph.entities.length) {
            this.data.reverseFieldOskaFieldParagraph.entities = this.data.reverseFieldOskaFieldParagraph.entities.sort((elem1, elem2) => {
              if(elem1.paragraphReference[0].entityLabel > elem2.paragraphReference[0].entityLabel) {
                return 1;
              } else {
                return -1;
              }
            });
          }
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

  getCompetitionLabel (val) {
    if (val > 0 && val < 6) {
      return this.competitionLabels[val - 1];
    }
    return '';
  }
  
  formatNumber (number, locale) {
    let num = parseInt(number, 10)
    let formattedNum = num.toLocaleString(locale)
    return formattedNum.replace(',', ' ')
  }

  indicatorValues (item) {
    let res = [];
    let employed = {};
    let pay = {};
    let values = item.forEach(elem => {
      if (elem.oskaId === 1) employed = elem;
      if (elem.oskaId === 3) pay = elem;
    });
    if (employed['oskaId']) res.push(employed);
    if (pay['oskaId']) res.push(pay);
    return res;
  }

  ngOnInit() {
    this.userLoggedOut = this.user.getData()['isExpired'];
    this.getData();
  }
}
