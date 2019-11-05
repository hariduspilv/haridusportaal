import { Component, OnInit, HostListener } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { HttpService } from '@app/_services/httpService';

@Component({
  templateUrl: './oska.frontpage.component.html',
  styleUrls: ['./oska.frontpage.component.scss']
})

export class OskaFrontPageComponent {

	public generalData: any = false;
  public fieldsData: any = false;
  public hasScrolled: boolean = false;
  public fieldBottomHeading: string = '';
  
	public fieldsLink: Object = {
    name: 'frontpage.view_all_fields',
    url: '/valdkonnad'
  };
	public fieldsLabels: Object = {
    image: 'fieldOskaFieldPicture',
    title: 'title',
    url: 'entityUrl'
  };

  public footerData: Array<Object> = [
    {
      title: 'Kutsekoda',
      link: 'www.kutsekoda.ee',
      url: {
        routed: false,
        path: 'https://www.kutsekoda.ee'
      },
      image: {
        standard: '/assets/img/kutsekoda-logo.svg',
        hover: '/assets/img/kutsekoda-logo-colored.svg'
      },
    },
    {
      title: 'OSKA',
      link: 'oska.kutsekoda.ee',
      url: {
        routed: false,
        path: 'https://oska.kutsekoda.ee'
      },
      image: {
        standard: '/assets/img/oska-logo.svg',
        hover: '/assets/img/oska-logo-colored.svg'
      },
    },
  ]
	public footerLabels: Object = {
    image: 'image',
    title: 'title',
    link: 'link',
    url: 'url'
  };
  public introLabels: Object = {
    link: 'title',
    url: 'url'
  };
  public introImage: Object = {
    standard: '/assets/img/frontpage/frontpage-button-default.svg',
    hover: '/assets/img/frontpage/frontpage-button-hover.svg'
  };
	public lang: string;
  
  constructor (
    private rootScope:RootScopeService,
    private http: HttpService
  ) {}

  getGeneral() {
    
    let variables = {lang: this.lang.toUpperCase()}

    this.http.get('oskaFrontPageQuery', {params:variables}).subscribe(response => {
      if (response['errors'] && response['errors'].length) {
        this.generalData = [];
      } else {
        this.generalData = response['data']['nodeQuery']['entities'];
        let fieldBottomTopicEntity = this.generalData[0].fieldBottomTopic.entity;
        if (fieldBottomTopicEntity['fieldMainProfessionPicture']) { this.fieldBottomHeading = 'oska.title_main_profession'; }
        if (fieldBottomTopicEntity['fieldOskaFieldPicture']) { this.fieldBottomHeading = 'oska.title_field'; }
        if (fieldBottomTopicEntity['fieldSurveyPagePicture']) { this.fieldBottomHeading = 'oska.workforcePrognosis'; }
        if (fieldBottomTopicEntity['fieldResultsPagePicture']) { this.fieldBottomHeading = 'oska.results'; }
      }
    },(data) => {
      this.generalData = [];
    });
  }
  
  getFields () {
    let variables = {
      lang: this.lang.toUpperCase(),
      offset: 0,
      limit: 3,
      nidEnabled: false
    };

    this.http.get('oskaFieldListView', {params:variables}).subscribe(response => {
      if (response['errors']) {
        this.fieldsData = [];
        return;
      }
      this.fieldsData = response['data']['nodeQuery']['entities'];
      this.fieldsData.forEach(element => {
        if (element && !element.fieldOskaFieldPicture) {
          element.fieldOskaFieldPicture = { derivative: {url: '/assets/img/1208x680.png'}}
        }
      });
    }, (err) => {
      this.fieldsData = [];
    })
  }

  onScroll () {
    const scrollPast = document.querySelector('.scroll__past');
    if (scrollPast) {
      const rect = scrollPast.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const viewHeight = window.innerHeight;
      if ((rect.top + rect.height) < viewHeight || !scrollPosition) {
        this.hasScrolled = window.scrollY > 1
      } else {
        this.hasScrolled = false
      }
    }
  }

  ngOnInit() {
    this.lang = this.rootScope.get("lang");
    this.getFields();
    this.getGeneral();
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.onScroll();
  }
}
