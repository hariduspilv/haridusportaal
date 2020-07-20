import { Component, OnInit, Input, HostListener } from '@angular/core';
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
  private oskaAreaIndicators:any = false;

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
              if(elem1 === null || elem2 === null) {
                return 1;
              }
              if(elem1.paragraphReference[0].entityLabel.toLowerCase() > elem2.paragraphReference[0].entityLabel.toLowerCase()) return 1;
              if(elem1.paragraphReference[0].entityLabel.toLowerCase() < elem2.paragraphReference[0].entityLabel.toLowerCase()) return -1;
              return 0;
            });
          }
        }

        if (this.data.fieldSidebar) {
          this.sidebarData = this.data.fieldSidebar.entity;
        } else if (this.data.fieldOskaFieldSidebar) {
          this.sidebarData = this.data.fieldOskaFieldSidebar.entity;
          /* here be dragons */
          this.oskaAreaIndicators = { entities: []};
          let hasFieldNumberEmployed = false;
          if(this.data.fieldOskaFieldSidebar.entity.fieldNumberEmployed) {
            this.oskaAreaIndicators['entities'].push({
              oskaId: 1,
              value: this.data.fieldOskaFieldSidebar.entity.fieldNumberEmployed,
              oskaIndicator: "Hõivatute arv",
              icon: this.getFieldNumberEmployedIcon(this.data.fieldOskaFieldSidebar.entity.fieldNumberEmployed),
            })
            hasFieldNumberEmployed = true;
          }
          if(this.data.fieldOskaFieldSidebar.entity.fieldEmploymentChange && hasFieldNumberEmployed){
            this.oskaAreaIndicators['entities'].push({
              oskaId: 2,
              value: this.data.fieldOskaFieldSidebar.entity.fieldEmploymentChange,
              oskaIndicator: "Hõive muutus",
              icon: this.data.fieldOskaFieldSidebar.entity.fieldEmploymentChange,
            });
          }
        } else if (this.data.fieldSurveyPageSidebar) {
          this.sidebarData = this.data.fieldSurveyPageSidebar.entity;
        }

        subscription.unsubscribe();

      });
    }
    
  }

  /* sorry father for i have sinned */
  getFieldNumberEmployedIcon (val) {
    if(val < 10000) {
      return 1
    } else if ( val >= 10000 && val < 15000) {
      return 2
    } else if ( val >= 15000 && val < 20000) {
      return 3
    } else if ( val >= 20000 && val < 25000) {
      return 4
    } else if ( val >= 25000 && val < 30000) {
      return 5
    } else if ( val >= 30000 && val < 35000) {
      return 6
    } else if ( val >= 35000 && val < 45000) {
      return 7
    } else if ( val >= 45000 && val < 55000) {
      return 8
    } else if ( val >= 55000 && val < 65000) {
      return 9
    } else if ( val >= 65000 && val < 75000) {
      return 10
    } else {
      return 11;
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
    item = item.filter(el => el != null);
    let values = item.forEach(elem => {
      if (elem && elem.oskaId === 1) employed = elem;
      if (elem && elem.oskaId === 3) pay = elem;
    });
    if (employed['oskaId']) res.push(employed);
    if (pay['oskaId']) res.push(pay);
    return res;
  }

  ngOnInit() {
    this.userLoggedOut = this.user.getData()['isExpired'];
    this.getData();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.rootScope.set('scrollRestorationState', true);
  }
}
