import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/_services/settings.service';
import { HttpService } from '@app/_services/httpService';

@Component({
  templateUrl: './oska.frontpage.component.html',
  styleUrls: ['./oska.frontpage.component.scss']
})

export class OskaFrontPageComponent {

	public generalData: any = false;
	public fieldsData: any = false;
	public fieldsLabels: Object = {
    image: 'fieldOskaFieldPicture',
    title: 'title',
    url: 'entityUrl'
  };
	public lang: string;
  public mobileView: boolean = false;
  
  constructor (
    private rootScope:RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private settings: SettingsService
  ) {}

  getGeneral() {
    
    let variables = {lang: this.lang.toUpperCase()}

    this.http.get('oskaFrontPageQuery', {params:variables}).subscribe(response => {
      if (response['errors'] && response['errors'].length) {
        this.generalData = [];
      } else {
        this.generalData = response['data']['nodeQuery']['entities'];
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
    }, (err) => {
      this.fieldsData = [];
    })
  }

  ngOnInit() {
    this.lang = this.rootScope.get("lang");
    this.getFields();
    this.getGeneral();
  }
}
